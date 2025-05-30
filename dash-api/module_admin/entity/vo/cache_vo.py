# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  module_admin/entity/vo/cache_vo.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

from pydantic import BaseModel, Field
from typing import Any, List, Optional


class CacheMonitorModel(BaseModel):
    """
    缓存监控信息对应pydantic模型
    """

    command_stats: Optional[List] = Field(default=[], description='命令统计')
    db_size: Optional[int] = Field(default=None, description='Key数量')
    info: Optional[dict] = Field(default={}, description='Redis信息')


class CacheInfoModel(BaseModel):
    """
    缓存监控对象对应pydantic模型
    """

    cache_key: Optional[str] = Field(default=None, description='缓存键名')
    cache_name: Optional[str] = Field(default=None, description='缓存名称')
    cache_value: Optional[Any] = Field(default=None, description='缓存内容')
    remark: Optional[str] = Field(default=None, description='备注')
