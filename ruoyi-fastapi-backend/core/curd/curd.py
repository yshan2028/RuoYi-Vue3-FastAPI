from typing import Any, Generic, Iterable, Sequence, Type, TypeVar, Dict, List
from sqlalchemy import Row, RowMapping, Select, delete, inspect, select, update, func, insert
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from datetime import datetime
from app.middleware.RedisManager import RedisHelper
from app.utils.websocket_manager import WebSocketManager
from app.auth.permission import check_permission

from core.curd.errors import CompositePrimaryKeysError
from core.curd.types import Model, CreateSchema, UpdateSchema
from core.curd.utils import parse_filters
from exceptions.exception import ServiceException

# Python 3.12 的类型优化
ModelType: TypeVar = TypeVar("ModelType", bound=Model)


class CRUDBase(Generic[ModelType]):

    def __init__(self, model: Type[ModelType]):
        """初始化 CRUD 对象"""
        self.model = model
        self.primary_key = self._get_primary_key()

    def _get_primary_key(self):
        """获取模型的主键字段"""
        mapper = inspect(self.model)
        primary_key = mapper.primary_key
        if len(primary_key) == 1:
            return primary_key[0]
        else:
            raise CompositePrimaryKeysError("不支持组合主键")

    @staticmethod
    async def track_changes(old_data: ModelType, new_data: dict) -> dict:
        """记录字段变更（旧值 → 新值）"""
        changes = {}
        for key, value in new_data.items():
            old_value = getattr(old_data, key, None)
            if old_value != value:
                changes[key] = {"old": old_value, "new": value}
        return changes

    async def get(self, session: AsyncSession, pk: int) -> ModelType | None:
        """通过 ID 获取单条记录（带缓存）"""
        cache_key = f"{self.model.__name__}:{pk}"
        cached_data = await RedisHelper.get(cache_key)
        if cached_data:
            return cached_data

        stmt = select(self.model).where(self.primary_key == pk)
        query = await session.execute(stmt)
        result = query.scalars().first()

        if result:
            await RedisHelper.set(cache_key, result, expire=3600)

        return result

    async def create(self, session: AsyncSession, obj: CreateSchema, commit: bool = False) -> ModelType:
        """创建记录，并记录日志"""
        instance = self.model(**obj.model_dump())
        session.add(instance)
        if commit:
            await session.commit()
        else:
            await session.flush()

        await self.log_change(session, "CREATE", instance.id)
        await WebSocketManager().broadcast({"event": "created", "model": self.model.__name__, "id": instance.id})
        return instance

    async def update(self, session: AsyncSession, pk: int, obj: UpdateSchema | dict[str, Any], commit: bool = False) -> dict:
        """更新记录，并记录变更日志"""
        existing = await self.get(session, pk)
        if not existing:
            raise ServiceException(message="记录不存在")

        old_data = existing.__dict__.copy()
        stmt = update(self.model).where(self.primary_key == pk).values(**obj.model_dump() if not isinstance(obj, dict) else obj)
        await session.execute(stmt)

        if commit:
            await session.commit()
        else:
            await session.flush()

        changes = self.track_changes(existing, obj)
        await self.log_change(session, "UPDATE", pk, changes)

        await WebSocketManager().broadcast({"event": "updated", "model": self.model.__name__, "id": pk})
        return changes

    async def delete(self, session: AsyncSession, pk: int, commit: bool = False) -> int:
        """删除记录，并记录日志"""
        stmt = delete(self.model).where(self.primary_key == pk)
        result = await session.execute(stmt)

        if commit:
            await session.commit()
        else:
            await session.flush()

        await self.log_change(session, "DELETE", pk)
        await WebSocketManager().broadcast({"event": "deleted", "model": self.model.__name__, "id": pk})
        return result.rowcount

    async def restore(self, session: AsyncSession, pk: int, commit: bool = False) -> ModelType | None:
        """恢复已软删除的数据，并记录日志"""
        stmt = update(self.model).where(self.primary_key == pk).values(is_delete=False, deleted_at=None)
        await session.execute(stmt)

        if commit:
            await session.commit()
        else:
            await session.flush()

        await self.log_change(session, "RESTORE", pk)
        return await self.get(session, pk)

    async def bulk_create(self, session: AsyncSession, objs: Iterable[CreateSchema], commit: bool = False) -> List[ModelType]:
        """批量创建数据，并记录日志"""
        instances = [self.model(**obj.model_dump()) for obj in objs]
        session.add_all(instances)
        if commit:
            await session.commit()
        else:
            await session.flush()

        for instance in instances:
            await self.log_change(session, "CREATE", instance.id)

        return instances

    async def bulk_delete(self, session: AsyncSession, ids: List[int], commit: bool = False) -> int:
        """批量删除记录，并记录日志"""
        stmt = delete(self.model).where(self.primary_key.in_(ids))
        result = await session.execute(stmt)

        if commit:
            await session.commit()
        else:
            await session.flush()

        for pk in ids:
            await self.log_change(session, "DELETE", pk)

        return result.rowcount

    async def bulk_update(self, session: AsyncSession, updates: List[Dict[str, Any]], commit: bool = False) -> int:
        """批量更新数据，并记录变更日志"""
        if not updates:
            return 0

        for update_data in updates:
            pk = update_data.pop("id", None)
            if not pk:
                continue

            stmt = update(self.model).where(self.primary_key == pk).values(**update_data)
            await session.execute(stmt)

            existing = await self.get(session, pk)
            changes = self.track_changes(existing, update_data)
            await self.log_change(session, "UPDATE", pk, changes)

        if commit:
            await session.commit()
        else:
            await session.flush()

        return len(updates)

    async def log_change(self, session: AsyncSession, action: str, pk: int, user_id: int, changes: dict = None):
        """
        记录数据变更日志到数据库
        :param session: 数据库会话
        :param action: 操作类型（CREATE / UPDATE / DELETE / RESTORE）
        :param pk: 记录的主键 ID
        :param user_id: 操作人 ID
        :param changes: 变更的字段详情（{字段名: {"old": 旧值, "new": 新值}}）
        """
        log_entry = {
            "model": self.model.__name__,
            "action": action,
            "record_id": pk,
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "changes": changes or {}
        }
        await session.execute(insert(AuditLog).values(**log_entry))  # 存入数据库
        await session.commit()
        return log_entry

    async def create_if_not_exists(self, session: AsyncSession, obj: CreateSchema, unique_fields: List[str], user_id: int, commit: bool = False) -> ModelType:
        """如果记录不存在则创建（幂等操作）"""
        filters = {field: getattr(obj, field) for field in unique_fields}
        existing = await self.get_by_fields(session, **filters)
        if existing:
            return existing

        return await self.create(session, obj, user_id, commit)

    async def get_by_fields(self, session: AsyncSession, **filters) -> ModelType | None:
        """按多个字段查询"""
        stmt = select(self.model).where(*[getattr(self.model, k) == v for k, v in filters.items()])
        query = await session.execute(stmt)
        return query.scalars().first()

    async def list(self, session: AsyncSession, filters: dict = None, order_by: str = None, desc: bool = False, limit: int = 100) -> List[ModelType]:
        """支持过滤、排序、字段选择"""
        stmt = select(self.model).where(self.model.is_delete == False)
        if filters:
            stmt = stmt.where(*[getattr(self.model, k) == v for k, v in filters.items()])
        if order_by:
            stmt = stmt.order_by(getattr(self.model, order_by).desc() if desc else getattr(self.model, order_by))
        stmt = stmt.limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    async def update_with_version(self, session: AsyncSession, pk: int, obj: dict, user_id: int, commit: bool = False) -> dict:
        """更新记录，并支持乐观锁（版本控制）"""
        existing = await self.get(session, pk)
        if not existing:
            raise ServiceException(message="记录不存在")

        old_version = existing.version
        obj["version"] = old_version + 1

        stmt = update(self.model).where(self.primary_key == pk, self.model.version == old_version).values(**obj)
        result = await session.execute(stmt)

        if result.rowcount == 0:
            raise ServiceException(message="数据已被其他用户修改，请刷新后重试")

        if commit:
            await session.commit()
        else:
            await session.flush()

        changes = self.track_changes(existing, obj)
        await self.log_change(session, "UPDATE", pk, user_id, changes)
        return changes

    async def restore_bulk(self, session: AsyncSession, ids: List[int], user_id: int, commit: bool = False) -> int:
        """批量恢复软删除数据"""
        stmt = update(self.model).where(self.primary_key.in_(ids)).values(is_delete=False, deleted_at=None)
        result = await session.execute(stmt)

        if commit:
            await session.commit()
        else:
            await session.flush()

        for pk in ids:
            await self.log_change(session, "RESTORE", pk, user_id)
        return result.rowcount

    async def notify_webhook(self, event: str, record_id: int, user_id: int):
        """触发 Webhook 事件通知"""
        webhook_data = {
            "event": event,
            "model": self.model.__name__,
            "record_id": record_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await WebSocketManager().broadcast(webhook_data)  # WebSocket 广播
        # 这里可以扩展成发送 HTTP 请求到外部系统

    async def get_with_cache(self, session: AsyncSession, pk: int) -> ModelType | None:
        """支持 Redis 缓存的 `get()` 方法"""
        cache_key = f"{self.model.__name__}:{pk}"
        cached_data = await RedisHelper.get(cache_key)
        if cached_data:
            return cached_data

        stmt = select(self.model).where(self.primary_key == pk, self.model.is_delete == False)
        query = await session.execute(stmt)
        result = query.scalars().first()

        if result:
            await RedisHelper.set(cache_key, result, expire=3600)

        return result