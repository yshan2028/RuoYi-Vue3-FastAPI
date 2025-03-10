from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, JSON, text, Text
from config.database import Base


class SysMenu(Base):
    """
    菜单权限表
    """

    __tablename__ = 'sys_menu'

    menu_id = Column(Integer, primary_key=True, autoincrement=True, comment='菜单ID')
    parent_id = Column(Integer, default=0, comment='父菜单ID')
    title = Column(String(50), nullable=False, default='', comment='菜单名称')
    path = Column(String(200), nullable=True, default='', comment='路由地址')
    component = Column(String(255), nullable=True, default=None, comment='组件路径')
    menu_type = Column(Integer, nullable=False, default=0, comment='菜单类型（0目录 0菜单 1按钮）')
    order_num = Column(Integer, default=0, comment='显示顺序')
    authority = Column(String(100), nullable=True, default=None, comment='权限标识')
    icon = Column(String(100), nullable=True, default='#', comment='菜单图标')
    hide = Column(Integer, nullable=False, default=0, comment='是否隐藏（0显示 1隐藏）')
    meta = Column(Text, nullable=False, default=None, comment='额外信息（多语言、激活路径等）')
    deleted = Column(Integer, nullable=False, default=0, comment='是否删除（0否 1是）')
    tenant_id = Column(Integer, nullable=False, default=0, comment='租户ID')
    query = Column(String(255), nullable=True, default=None, comment='路由参数')
    route_name = Column(String(50), nullable=True, default='', comment='路由名称')
    is_frame = Column(Integer, default=1, comment='是否为外链（0是 1否）')
    is_cache = Column(Integer, default=0, comment='是否缓存（0缓存 1不缓存）')
    create_by = Column(String(64), nullable=True, default='', comment='创建者')
    create_time = Column(DateTime, nullable=True, default=datetime.now(), comment='创建时间')
    update_by = Column(String(64), nullable=True, default='', comment='更新者')
    update_time = Column(DateTime, nullable=True, default=datetime.now(), comment='更新时间')
    remark = Column(String(500), nullable=True, default='', comment='备注')