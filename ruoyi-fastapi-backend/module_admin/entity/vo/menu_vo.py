from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from pydantic_validation_decorator import NotBlank, Size
from typing import Literal, Optional, Union


class MenuModel(BaseModel):
    """
    菜单表对应 Pydantic 模型
    """

    model_config = ConfigDict(from_attributes=True)

    menu_id: Optional[int] = Field(default=None, description='菜单ID')
    parent_id: Optional[int] = Field(default=0, description='父菜单ID')
    title: Optional[str] = Field(default=None, max_length=50, description='菜单名称')
    path: Optional[str] = Field(default=None, max_length=200, description='路由地址')
    component: Optional[str] = Field(default=None, max_length=255, description='组件路径')
    menu_type: Optional[int] = Field(default=0, description='菜单类型（0目录 1菜单 2按钮）')
    order_num: Optional[int] = Field(default=0, description='显示顺序')
    authority: Optional[str] = Field(default=None, max_length=100, description='权限标识')
    icon: Optional[str] = Field(default='#', max_length=100, description='菜单图标')
    hide: Optional[int] = Field(default=0, description='是否隐藏（0显示 1隐藏）')
    meta: Optional[dict] = Field(default=None, description='额外信息（多语言、激活路径等）')
    deleted: Optional[int] = Field(default=0, description='是否删除（0否 1是）')
    tenant_id: Optional[int] = Field(default=0, description='租户ID')
    query: Optional[str] = Field(default=None, max_length=255, description='路由参数')
    route_name: Optional[str] = Field(default=None, max_length=50, description='路由名称')
    is_frame: Optional[Union[int, Literal[0, 1]]] = Field(default=1, description='是否为外链（0是 1否）')
    is_cache: Optional[Union[int, Literal[0, 1]]] = Field(default=0, description='是否缓存（0缓存 1不缓存）')
    create_by: Optional[str] = Field(default=None, description='创建者')
    create_time: Optional[datetime] = Field(default=None, description='创建时间')
    update_by: Optional[str] = Field(default=None, description='更新者')
    update_time: Optional[datetime] = Field(default=None, description='更新时间')
    remark: Optional[str] = Field(default=None, description='备注')

    @NotBlank(field_name='title', message='菜单名称不能为空')
    @Size(field_name='title', min_length=0, max_length=50, message='菜单名称长度不能超过50个字符')
    def get_title(self):
        return self.title

    @NotBlank(field_name='order_num', message='显示顺序不能为空')
    def get_order_num(self):
        return self.order_num

    @Size(field_name='path', min_length=0, max_length=200, message='路由地址长度不能超过200个字符')
    def get_path(self):
        return self.path

    @Size(field_name='component', min_length=0, max_length=255, message='组件路径长度不能超过255个字符')
    def get_component(self):
        return self.component

    @NotBlank(field_name='menu_type', message='菜单类型不能为空')
    def get_menu_type(self):
        return self.menu_type

    @Size(field_name='authority', min_length=0, max_length=100, message='权限标识长度不能超过100个字符')
    def get_authority(self):
        return self.authority

    def validate_fields(self):
        self.get_title()
        self.get_order_num()
        self.get_path()
        self.get_component()
        self.get_menu_type()
        self.get_authority()


class MenuQueryModel(MenuModel):
    """
    菜单管理不分页查询模型
    """

    begin_time: Optional[str] = Field(default=None, description='开始时间')
    end_time: Optional[str] = Field(default=None, description='结束时间')


class DeleteMenuModel(BaseModel):
    """
    删除菜单模型
    """

    menu_ids: str = Field(description='需要删除的菜单ID')
