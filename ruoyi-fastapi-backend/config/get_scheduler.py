import hashlib
import importlib
import json
import threading
import time
import traceback
from asyncio import iscoroutinefunction
from datetime import datetime, timedelta
from typing import Union, Any, Optional, Tuple

# 第三方库导入
import redis
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.executors.pool import ProcessPoolExecutor
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.jobstores.redis import RedisJobStore
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.engine import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

# 引入动态任务模块
import module_task  # noqa: F401
# 本地导入
from config.database import AsyncSessionLocal, quote_plus
from config.env import DataBaseConfig, RedisConfig
from module_admin.dao.job_dao import JobDao
from module_admin.entity.vo.job_vo import JobLogModel, JobModel
from module_admin.service.job_log_service import JobLogService
from utils.log_util import logger


class MyCronTrigger(CronTrigger):
    """增强版CronTrigger，支持扩展的crontab格式"""

    @classmethod
    def from_crontab(cls, expr: str, timezone=None):
        """解析crontab表达式并创建CronTrigger实例

        支持标准crontab格式以及额外的特性，如'L', 'W', 和 '#'

        参数:
            expr: crontab表达式字符串 (6-7个字段)
            timezone: 可选的时区

        返回:
            配置了解析值的MyCronTrigger实例

        异常:
            ValueError: 如果表达式格式无效
        """
        values = expr.split()
        if len(values) != 6 and len(values) != 7:
            raise ValueError(f'字段数量错误; 得到 {len(values)}, 期望 6 或 7')

        second, minute, hour = values[0], values[1], values[2]

        # 处理日期字段
        day = None
        if '?' in values[3]:
            day = None
        elif 'L' in values[5]:
            day = f"last {values[5].replace('L', '')}"
        elif 'W' in values[3]:
            day = cls._find_recent_workday(int(values[3].split('W')[0]))
        else:
            day = values[3].replace('L', 'last')

        month = values[4]

        # 处理星期字段
        week = None
        day_of_week = None
        if '?' in values[5] or 'L' in values[5]:
            week = None
        elif '#' in values[5]:
            week = int(values[5].split('#')[1])
            day_of_week = int(values[5].split('#')[0]) - 1
        else:
            week = values[5]

        year = values[6] if len(values) == 7 else None

        return cls(
            second=second,
            minute=minute,
            hour=hour,
            day=day,
            month=month,
            week=week,
            day_of_week=day_of_week,
            year=year,
            timezone=timezone,
        )

    @classmethod
    def _find_recent_workday(cls, day: int) -> int:
        """查找指定月份日期最接近的工作日（周一至周五）

        参数:
            day: 目标月份日期

        返回:
            工作日对应的月份日期（周一至周五）
        """
        now = datetime.now()
        date = datetime(now.year, now.month, day)

        # 如果该日期已经是工作日（0-4表示周一至周五）
        if date.weekday() < 5:
            return date.day

        # 查找最接近的前一个工作日
        diff = 1
        while True:
            previous_day = date - timedelta(days=diff)
            if previous_day.weekday() < 5:
                return previous_day.day
            diff += 1


class DatabaseManager:
    """数据库连接管理器"""

    @classmethod
    def get_database_url(cls) -> str:
        """根据配置构建数据库连接URL

        返回:
            str: 格式化的数据库URL字符串
        """
        if DataBaseConfig.db_type == 'postgresql':
            return (
                f'postgresql+psycopg2://{DataBaseConfig.db_username}:{quote_plus(DataBaseConfig.db_password)}@'
                f'{DataBaseConfig.db_host}:{DataBaseConfig.db_port}/{DataBaseConfig.db_database}'
            )

        # 默认使用MySQL
        return (
            f'mysql+pymysql://{DataBaseConfig.db_username}:{quote_plus(DataBaseConfig.db_password)}@'
            f'{DataBaseConfig.db_host}:{DataBaseConfig.db_port}/{DataBaseConfig.db_database}'
        )

    @classmethod
    def create_engine_and_session(cls):
        """创建并配置数据库引擎和会话工厂

        返回:
            tuple: (engine, session_factory)
        """
        db_url = cls.get_database_url()

        engine = create_engine(
            db_url,
            echo=DataBaseConfig.db_echo,
            max_overflow=DataBaseConfig.db_max_overflow,
            pool_size=DataBaseConfig.db_pool_size,
            pool_recycle=DataBaseConfig.db_pool_recycle,
            pool_timeout=DataBaseConfig.db_pool_timeout,
        )

        session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        return engine, session_factory


# 创建数据库引擎和会话
engine, SessionLocal = DatabaseManager.create_engine_and_session()
db_url = DatabaseManager.get_database_url()

# 配置任务存储
job_stores = {
    'default': SQLAlchemyJobStore(url=db_url, engine=engine),
    'sqlalchemy': SQLAlchemyJobStore(url=db_url, engine=engine),
    'redis': RedisJobStore(
        host=RedisConfig.redis_host,
        port=RedisConfig.redis_port,
        username=RedisConfig.redis_username,
        password=RedisConfig.redis_password,
        db=RedisConfig.redis_database,
    ),
    'memory': MemoryJobStore(),  # 为了向后兼容
}

# 配置执行器和任务默认参数
executors = {
    'default': AsyncIOExecutor(),
    'processpool': ProcessPoolExecutor(5)
}

job_defaults = {
    'coalesce': True,  # 合并错过的执行为一个
    'max_instances': 1,  # 默认限制同时只运行一个实例
    'misfire_grace_time': 60  # 默认错过执行的宽限时间为60秒
}

# 创建并配置调度器
scheduler = AsyncIOScheduler()
scheduler.configure(
    jobstores=job_stores,
    executors=executors,
    job_defaults=job_defaults
)


class RedisLockManager:
    """使用Redis管理分布式锁"""

    _client = None

    @classmethod
    def get_client(cls) -> redis.Redis:
        """获取或创建用于分布式锁的Redis客户端

        返回:
            redis.Redis: 已配置的Redis客户端实例
        """
        if cls._client is None:
            try:
                cls._client = redis.Redis(
                    host=RedisConfig.redis_host,
                    port=RedisConfig.redis_port,
                    username=RedisConfig.redis_username,
                    password=RedisConfig.redis_password,
                    db=RedisConfig.redis_database,
                    decode_responses=True,  # 更可靠的字符串处理
                    socket_timeout=3.0,  # 避免连接问题导致挂起
                    socket_connect_timeout=3.0,
                    health_check_interval=30,  # 定期检查连接健康状态
                    retry_on_timeout=True  # 超时时自动重试
                )
                # 测试连接
                cls._client.ping()
                logger.info("Redis连接成功初始化")
            except redis.RedisError as e:
                logger.error(f"Redis连接初始化失败: {str(e)}")

                # 创建一个空的实现，以防连接失败时不中断应用
                class DummyRedis:
                    def lock(self, *args, **kwargs):
                        return DummyLock()

                    def keys(self, pattern):
                        return []

                    def delete(self, *args):
                        pass

                    def expire(self, *args, **kwargs):
                        pass

                class DummyLock:
                    def acquire(self, *args, **kwargs):
                        return True

                    def release(self):
                        pass

                cls._client = DummyRedis()
                logger.warning("使用虚拟Redis客户端作为回退")

        return cls._client

    @classmethod
    def clear_locks(cls, pattern="scheduler_lock:*"):
        """清理指定模式的锁

        参数:
            pattern: 锁键名模式

        返回:
            int: 清理的锁数量
        """
        try:
            redis_client = cls.get_client()
            keys = redis_client.keys(pattern)

            if keys:
                count = len(keys)
                redis_client.delete(*keys)
                logger.info(f"已清理 {count} 个锁 (模式: {pattern})")
                return count
            return 0
        except Exception as e:
            logger.warning(f"清理锁 {pattern} 时出错: {str(e)}")
            return 0


class LockRenewer:
    """分布式锁自动续约器"""

    def __init__(self, redis_client, lock_name, timeout=60, renew_interval=30):
        """初始化锁续约器

        参数:
            redis_client: Redis客户端
            lock_name: 锁名称
            timeout: 锁超时时间(秒)
            renew_interval: 续约间隔(秒)
        """
        self.redis_client = redis_client
        self.lock_name = lock_name
        self.timeout = timeout
        self.renew_interval = renew_interval
        self.stop_event = threading.Event()
        self.renew_thread = None

    def start(self):
        """启动自动续约线程"""

        def _renew_loop():
            while not self.stop_event.is_set():
                try:
                    # 使用EXPIRE命令刷新锁的过期时间
                    self.redis_client.expire(self.lock_name, self.timeout)
                    logger.debug(f"已续约锁 {self.lock_name}, 过期时间 {self.timeout}秒")
                except Exception as e:
                    logger.warning(f"续约锁 {self.lock_name} 时出错: {str(e)}")

                # 等待下一次续约时间
                self.stop_event.wait(self.renew_interval)

        self.renew_thread = threading.Thread(target=_renew_loop)
        self.renew_thread.daemon = True
        self.renew_thread.start()

    def stop(self):
        """停止自动续约"""
        self.stop_event.set()
        if self.renew_thread:
            self.renew_thread.join(timeout=1.0)


def acquire_with_retry(lock, max_retries=3, retry_interval=1.0):
    """尝试获取锁，失败时重试

    参数:
        lock: Redis锁对象
        max_retries: 最大重试次数
        retry_interval: 重试间隔(秒)

    返回:
        bool: 是否成功获取锁
    """
    for retry in range(max_retries + 1):
        try:
            if lock.acquire(blocking=False):
                return True

            if retry < max_retries:
                logger.debug(f"获取锁失败，将在{retry_interval}秒后重试 (尝试 {retry + 1}/{max_retries})")
                time.sleep(retry_interval)
        except redis.RedisError as e:
            if retry < max_retries:
                logger.warning(f"Redis错误: {str(e)}，将在{retry_interval}秒后重试")
                time.sleep(retry_interval)
            else:
                logger.error(f"获取锁失败，已达到最大重试次数: {str(e)}")
                return False

    return False


def create_args_fingerprint(*args, **kwargs):
    """为任务参数创建指纹，使锁更精确

    返回:
        str: 参数的哈希指纹
    """
    # 将参数转换为字符串并排序，以确保一致性
    args_str = str(args) + str(sorted(kwargs.items()))
    return hashlib.md5(args_str.encode()).hexdigest()[:8]


def log_task_execution_time(func_path, start_time, success=True):
    """记录任务执行时间统计

    参数:
        func_path: 任务函数路径
        start_time: 开始时间
        success: 是否执行成功
    """
    duration_ms = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(f"任务 {func_path} {'成功' if success else '失败'} 执行用时: {duration_ms:.2f}毫秒")

    # 这里可以添加Prometheus或其他监控系统的指标收集
    # 例如: prometheus_client.SUMMARY.labels(func_path).observe(duration_ms)


# 分布式锁执行器，不再使用装饰器而是使用普通的可序列化函数
class DistributedExecutor:
    """分布式任务执行器，确保任务只在一个节点上执行一次"""

    @staticmethod
    def parse_func_path(func_path: str) -> Tuple[str, str]:
        """解析函数路径，支持两种格式：
        1. 使用点号分隔的标准Python路径: module.submodule.function
        2. 使用冒号分隔模块和函数: module.submodule:function

        参数:
            func_path: 函数的导入路径

        返回:
            Tuple[str, str]: (模块路径, 函数名)

        示例:
            "module.path.function" -> ("module.path", "function")
            "module.path:function" -> ("module.path", "function")
        """
        if ":" in func_path:
            # 处理冒号分隔格式
            return func_path.split(":", 1)
        else:
            # 处理点号分隔格式，最后一个点号后是函数名
            module_parts = func_path.split(".")
            if len(module_parts) < 2:
                raise ValueError(f"函数路径格式错误: {func_path}")

            module_path = ".".join(module_parts[:-1])
            func_name = module_parts[-1]
            return module_path, func_name

    @staticmethod
    async def execute_job_with_lock(func_path: str, *args, **kwargs) -> Any:
        """使用分布式锁执行任务

        支持两种函数路径格式:
        1. 使用点号分隔的标准Python路径: "module.submodule.function"
        2. 使用冒号分隔模块和函数: "module.submodule:function"

        参数:
            func_path: 函数的导入路径
            *args: 函数的位置参数
            **kwargs: 函数的关键字参数

        返回:
            函数的执行结果
        """
        start_time = datetime.now()
        success = False

        try:
            # 解析模块路径和函数名
            module_path, func_name = DistributedExecutor.parse_func_path(func_path)

            # 导入模块并获取函数
            try:
                module = importlib.import_module(module_path)
                func = getattr(module, func_name)
            except ImportError:
                logger.error(f"无法导入模块 {module_path}")
                # 尝试其他可能的解析方式
                parts = func_path.split(".")
                # 逐步尝试导入，处理深层次的模块导入
                for i in range(1, len(parts)):
                    try:
                        potential_module_path = ".".join(parts[:-i])
                        potential_func_path = ".".join(parts[-i:])
                        module = importlib.import_module(potential_module_path)
                        obj = module
                        for part in parts[-i:]:
                            obj = getattr(obj, part)
                        func = obj
                        break
                    except (ImportError, AttributeError):
                        continue
                else:
                    raise ImportError(f"找不到模块或函数: {func_path}")
            except AttributeError:
                logger.error(f"模块 {module_path} 中未找到函数 {func_name}")
                raise

            # 创建参数指纹，使锁更精确
            args_fingerprint = create_args_fingerprint(*args, **kwargs)

            # 创建锁名称，包含参数指纹
            lock_name = f"scheduler_lock:{func_path}:{args_fingerprint}"

            redis_client = RedisLockManager.get_client()
            # 使用60秒超时避免进程崩溃时的死锁
            lock = redis_client.lock(lock_name, timeout=60)
            have_lock = False

            try:
                # 尝试获取锁，带重试机制
                have_lock = acquire_with_retry(lock, max_retries=2, retry_interval=0.5)

                if have_lock:
                    logger.info(f"获得分布式锁，执行任务: {func_path}")

                    # 创建锁续约器，用于长时间运行的任务
                    renewer = LockRenewer(redis_client, lock_name, timeout=60, renew_interval=20)
                    renewer.start()

                    try:
                        # 根据函数是否是异步来执行
                        if iscoroutinefunction(func):
                            result = await func(*args, **kwargs)
                        else:
                            result = func(*args, **kwargs)

                        success = True
                        return result
                    finally:
                        # 停止锁续约
                        renewer.stop()

                else:
                    logger.info(f"任务 {func_path} 已在另一个实例上执行，跳过")
                    return None

            except redis.RedisError as e:
                logger.error(f"Redis分布式锁操作失败: {str(e)}")
                # 在Redis故障时仍然执行任务，但记录警告
                logger.warning(f"由于Redis故障，任务 {func_path} 将在没有分布式锁保护的情况下执行")
                if iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)

                success = True
                return result

            finally:
                # 如果获取了锁，则释放它
                if have_lock:
                    try:
                        lock.release()
                        logger.debug(f"已释放任务 {func_path} 的分布式锁")
                    except Exception as e:
                        logger.warning(f"释放任务 {func_path} 的锁时失败: {str(e)}")

        except ImportError as e:
            logger.error(f"无法导入模块或函数 {func_path}: {str(e)}")
            raise
        except AttributeError as e:
            logger.error(f"找不到函数 {func_path}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"执行任务 {func_path} 时出错: {str(e)}")
            logger.error(traceback.format_exc())
            raise
        finally:
            # 记录任务执行时间统计
            log_task_execution_time(func_path, start_time, success=success)


class SchedulerUtil:
    """调度任务管理实用工具类"""

    @classmethod
    async def init_system_scheduler(cls):
        """初始化并启动调度器，加载数据库中的所有活动任务"""
        logger.info('正在启动调度器并加载调度任务...')

        try:
            # 清理可能存在的过期锁
            await cls.clear_scheduler_locks()

            # 启动调度器
            if scheduler.running:
                logger.warning("调度器已经在运行中，跳过初始化")
                return

            scheduler.start()

            # 从数据库加载所有任务
            async with AsyncSessionLocal() as session:
                job_list = await JobDao.get_job_list_for_scheduler(session)

                for item in job_list:
                    try:
                        # 移除同ID的已存在任务
                        cls.remove_scheduler_job(job_id=str(item.job_id))
                        # 将任务添加到调度器
                        cls.add_scheduler_job(item)
                    except Exception as e:
                        logger.error(f"初始化任务 {item.job_name} (ID: {item.job_id}) 失败: {str(e)}")
                        logger.error(traceback.format_exc())

            # 添加调度器事件监听器
            scheduler.add_listener(cls.scheduler_event_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
            logger.info('系统调度器初始化成功')
        except Exception as e:
            logger.error(f"初始化系统调度器时出错: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @classmethod
    async def clear_scheduler_locks(cls):
        """启动时清理可能存在的过期锁"""
        try:
            count = RedisLockManager.clear_locks("scheduler_lock:*")
            if count > 0:
                logger.info(f"已清理 {count} 个遗留的调度器锁")
        except Exception as e:
            logger.warning(f"清理调度器锁时出错: {str(e)}")

    @classmethod
    async def close_system_scheduler(cls):
        """优雅地关闭调度器"""
        if scheduler.running:
            try:
                scheduler.shutdown(wait=False)  # 不等待正在运行的作业完成
                logger.info('调度器成功关闭')
            except Exception as e:
                logger.error(f"关闭调度器时出错: {str(e)}")
        else:
            logger.info('调度器已经处于关闭状态')

    @classmethod
    def get_scheduler_job(cls, job_id: Union[str, int]) -> Optional[Any]:
        """根据ID获取任务实例

        参数:
            job_id: 要获取的任务ID

        返回:
            找到时返回任务实例，否则返回None
        """
        try:
            return scheduler.get_job(job_id=str(job_id))
        except Exception as e:
            logger.error(f"获取任务 {job_id} 时出错: {str(e)}")
            return None

    @classmethod
    def add_scheduler_job(cls, job_info: JobModel) -> None:
        """根据提供的任务模型向调度器添加新任务

        参数:
            job_info: 包含任务配置的JobModel
        """
        try:
            # 获取调用目标
            invoke_target = job_info.invoke_target

            # 使用可序列化的DistributedExecutor.execute_job_with_lock方法作为任务函数
            job_func = 'config.get_scheduler:DistributedExecutor.execute_job_with_lock'

            # 确定合适的执行器
            job_executor = job_info.job_executor
            # 尝试判断原始函数是否为异步函数
            try:
                module_path, func_name = DistributedExecutor.parse_func_path(invoke_target)
                module = importlib.import_module(module_path)
                original_func = getattr(module, func_name)
                if iscoroutinefunction(original_func):
                    job_executor = 'default'  # 异步函数必须使用AsyncIOExecutor
            except (ImportError, AttributeError, ValueError) as e:
                logger.warning(f"无法确定函数 {invoke_target} 是否为异步: {str(e)}")
                # 如果无法确定，保留用户指定的执行器

            # 选择任务存储 - 如果指定的组不可用，则回退到默认存储
            jobstore = job_info.job_group if job_info.job_group in job_stores else 'default'

            # 解析原始参数
            args = job_info.job_args.split(',') if job_info.job_args and job_info.job_args.strip() else []
            kwargs = json.loads(job_info.job_kwargs) if job_info.job_kwargs and job_info.job_kwargs.strip() else {}

            # 将原始函数路径作为第一个参数，后面跟原始参数
            job_args = [invoke_target] + args

            # 根据策略确定错过执行的宽限时间
            if job_info.misfire_policy == '1':  # 立即执行一次
                misfire_grace_time = 60
            elif job_info.misfire_policy == '2':  # 执行一次
                misfire_grace_time = 60 * 60  # 一小时
            elif job_info.misfire_policy == '3':  # 放弃执行
                misfire_grace_time = None  # 不会触发错过的执行
            else:
                misfire_grace_time = 60  # 默认宽限时间为60秒

            # 配置并发性
            max_instances = 3 if job_info.concurrent == '0' else 1

            # 将任务添加到调度器
            scheduler.add_job(
                func=job_func,  # 使用可序列化的函数路径而不是函数对象
                trigger=MyCronTrigger.from_crontab(job_info.cron_expression),
                args=job_args,
                kwargs=kwargs,
                id=str(job_info.job_id),
                name=job_info.job_name,
                misfire_grace_time=misfire_grace_time,
                coalesce=True,  # 始终启用合并以避免任务重复执行
                max_instances=max_instances,
                jobstore=jobstore,
                executor=job_executor,
                replace_existing=True  # 如果任务已存在则替换它
            )

            logger.info(f"已添加调度任务 '{job_info.job_name}' 任务ID {job_info.job_id}")

        except Exception as e:
            logger.error(f"添加任务 {job_info.job_name} (ID: {job_info.job_id}) 时出错: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @classmethod
    def execute_scheduler_job_once(cls, job_info: JobModel) -> None:
        """立即执行任务一次

        参数:
            job_info: 包含任务配置的JobModel
        """
        try:
            # 获取调用目标
            invoke_target = job_info.invoke_target

            # 使用可序列化的DistributedExecutor.execute_job_with_lock方法作为任务函数
            job_func = 'config.get_scheduler:DistributedExecutor.execute_job_with_lock'

            # 确定合适的执行器
            job_executor = job_info.job_executor
            # 尝试判断原始函数是否为异步函数
            try:
                module_path, func_name = DistributedExecutor.parse_func_path(invoke_target)
                module = importlib.import_module(module_path)
                original_func = getattr(module, func_name)
                if iscoroutinefunction(original_func):
                    job_executor = 'default'
            except (ImportError, AttributeError, ValueError):
                pass

            # 解析参数
            args = job_info.job_args.split(',') if job_info.job_args and job_info.job_args.strip() else []
            kwargs = json.loads(job_info.job_kwargs) if job_info.job_kwargs and job_info.job_kwargs.strip() else {}

            # 将原始函数路径作为第一个参数
            job_args = [invoke_target] + args

            # 生成唯一的一次性执行ID
            unique_id = f"{job_info.job_id}_once_{int(datetime.now().timestamp())}"

            # 添加一个在1秒后运行一次的任务
            scheduler.add_job(
                func=job_func,  # 使用可序列化的函数路径
                trigger='date',
                run_date=datetime.now() + timedelta(seconds=1),
                args=job_args,
                kwargs=kwargs,
                id=unique_id,
                name=f"{job_info.job_name} (单次执行)",
                misfire_grace_time=60,  # 单次执行使用默认的60秒宽限时间
                coalesce=True,
                max_instances=1,  # 单次执行始终只允许一个实例
                jobstore='default',  # 单次执行始终使用默认存储
                executor=job_executor,
            )

            logger.info(f"已调度任务 '{job_info.job_name}' (ID: {job_info.job_id}) 的单次执行")

        except Exception as e:
            logger.error(f"调度任务 {job_info.job_name} 的单次执行时出错: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @classmethod
    def remove_scheduler_job(cls, job_id: Union[str, int]) -> bool:
        """从调度器中删除任务

        参数:
            job_id: 要删除的任务ID

        返回:
            bool: 删除成功返回True，任务不存在或删除失败返回False
        """
        try:
            query_job = cls.get_scheduler_job(job_id=job_id)
            if query_job:
                scheduler.remove_job(job_id=str(job_id))
                logger.info(f"已移除调度任务，任务ID {job_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"移除任务 {job_id} 时出错: {str(e)}")
            return False

    @classmethod
    def scheduler_event_listener(cls, event) -> None:
        """调度器事件监听器，记录任务执行详情

        参数:
            event: 调度器事件
        """
        try:
            # 只处理包含job_id的事件
            if not hasattr(event, 'job_id'):
                return

            # 获取事件类型并确定执行状态
            event_type = event.__class__.__name__
            status = '0'  # 默认成功
            exception_info = ''

            # 检查执行异常
            if hasattr(event, 'exception') and event.exception:
                exception_info = f"{str(event.exception)}\n{traceback.format_exc()}"
                status = '1'  # 错误

            job_id = event.job_id
            query_job = cls.get_scheduler_job(job_id=job_id)

            if query_job:
                try:
                    # 获取任务详情用于日志记录
                    job_state = query_job.__getstate__()
                    job_name = job_state.get('name', '未知')
                    job_group = query_job._jobstore_alias
                    job_executor = job_state.get('executor', 'default')

                    # 对于我们的新方法，实际的目标函数是第一个参数
                    args = job_state.get('args', [])
                    invoke_target = args[0] if args else '未知'

                    # 删除第一个参数（实际函数路径），只保留实际参数
                    job_args = ','.join([str(arg) for arg in args[1:] if arg is not None]) if len(args) > 1 else ''

                    # 处理kwargs，确保能正确序列化为JSON
                    try:
                        job_kwargs = json.dumps(job_state.get('kwargs', {}))
                    except (TypeError, ValueError):
                        job_kwargs = '{}'

                    job_trigger = str(job_state.get('trigger', ''))

                    # 创建日志消息
                    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    job_message = (
                        f"事件类型: {event_type}, 任务ID: {job_id}, "
                        f"任务名称: {job_name}, 执行时间: {current_time}"
                    )

                    # 创建任务日志记录
                    job_log = JobLogModel(
                        job_name=job_name,
                        job_group=job_group,
                        job_executor=job_executor,
                        invoke_target=invoke_target,
                        job_args=job_args,
                        job_kwargs=job_kwargs,
                        job_trigger=job_trigger,
                        job_message=job_message,
                        status=status,
                        exception_info=exception_info,
                        create_time=datetime.now(),
                    )

                    # 使用上下文管理器安全地保存任务日志到数据库
                    with SessionLocal() as session:
                        try:
                            JobLogService.add_job_log_services(session, job_log)
                            session.commit()
                        except SQLAlchemyError as db_error:
                            session.rollback()
                            logger.error(f"保存任务日志时数据库错误: {str(db_error)}")
                        except Exception as ex:
                            session.rollback()
                            logger.error(f"保存任务日志时未知错误: {str(ex)}")
                except Exception as e:
                    logger.error(f"处理调度器事件时出错: {str(e)}")
                    logger.error(traceback.format_exc())

        except Exception as e:
            logger.error(f"调度器事件监听器中发生错误: {str(e)}")
            logger.error(traceback.format_exc())
