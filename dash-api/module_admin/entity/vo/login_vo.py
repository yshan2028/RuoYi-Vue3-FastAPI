# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  module_admin/entity/vo/login_vo.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

import re
from datetime import datetime

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Union, Dict, Any
from exceptions.exception import ModelValidatorException
from module_admin.entity.vo.menu_vo import MenuModel


class UserLogin(BaseModel):
    user_name: str = Field(description='用户名称')
    password: str = Field(description='用户密码')
    code: Optional[str] = Field(default=None, description='验证码')
    uuid: Optional[str] = Field(default=None, description='会话编号')
    login_info: Optional[dict] = Field(default=None, description='登录信息，前端无需传递')
    captcha_enabled: Optional[bool] = Field(default=None, description='是否启用验证码，前端无需传递')


class UserRegister(BaseModel):
    username: str = Field(description='用户名称')
    password: str = Field(description='用户密码')
    confirm_password: str = Field(description='用户二次确认密码')
    code: Optional[str] = Field(default=None, description='验证码')
    uuid: Optional[str] = Field(default=None, description='会话编号')

    @model_validator(mode='after')
    def check_password(self) -> 'UserRegister':
        pattern = r"""^[^<>"'|\\]+$"""
        if self.password is None or re.match(pattern, self.password):
            return self
        else:
            raise ModelValidatorException(message='密码不能包含非法字符：< > " \' \\ |')


class Token(BaseModel):
    access_token: str = Field(description='token信息')
    token_type: str = Field(description='token类型')


class CaptchaCode(BaseModel):
    captcha_enabled: bool = Field(description='是否启用验证码')
    forget_enabled: bool = Field(description='是否启用忘记密码')
    register_enabled: bool = Field(description='是否启用注册')
    img: str = Field(description='验证码图片')
    uuid: str = Field(description='会话编号')


class SmsCode(BaseModel):
    is_success: Optional[bool] = Field(default=None, description='操作是否成功')
    sms_code: str = Field(description='短信验证码')
    session_id: str = Field(description='会话编号')
    message: Optional[str] = Field(default=None, description='响应信息')


class MenuTreeModel(MenuModel):
    children: Optional[Union[List['MenuTreeModel'], None]] = Field(default=None, description='子菜单')


class RouterModel(BaseModel):
    menu_id: Optional[int] = Field(default=None, description='菜单ID')
    parent_id: Optional[int] = Field(default=0, description='父菜单ID')
    title: Optional[str] = Field(default=None, description='菜单名称')
    path: Optional[str] = Field(default=None, description='路由地址')
    component: Optional[str] = Field(default=None, description='组件地址')
    hidden: Optional[bool] = Field(default=None, description='是否隐藏路由，当设置 true 的时候该路由不会再侧边栏出现')
    menu_type: Optional[int] = Field(default=0, description='菜单类型（0目录 0菜单 2按钮）')
    order_num: Optional[int] = Field(default=0, description='显示顺序')
    authority: Optional[str] = Field(default=None, description='权限标识')
    icon: Optional[str] = Field(default=None, description='菜单图标')
    hide: Optional[int] = Field(default=0, description='是否隐藏（0显示 1隐藏）')
    meta: Optional[str] = Field(default_factory=dict, description='额外信息（多语言、激活路径等）')
    deleted: Optional[int] = Field(default=0, description='是否删除（0否 1是）')
    tenant_id: Optional[int] = Field(default=0, description='租户ID')
    create_time: Optional[datetime] = Field(default=None, description='创建时间')
    update_time: Optional[datetime] = Field(default=None, description='更新时间')
    children: Optional[Union[List['RouterModel'], None]] = Field(default=None, description='子菜单')
    checked: Optional[bool] = Field(default=None, description='是否选中')
