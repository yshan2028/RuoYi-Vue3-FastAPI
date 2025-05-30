# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  module_admin/entity/vo/common_vo.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

from pydantic import BaseModel, Field
from typing import Any, Optional


class CrudResponseModel(BaseModel):
    """
    操作响应模型
    """

    is_success: bool = Field(description='操作是否成功')
    message: str = Field(description='响应信息')
    result: Optional[Any] = Field(default=None, description='响应结果')


class UploadResponseModel(BaseModel):
    """
    上传响应模型
    """

    file_name: Optional[str] = Field(default=None, description='新文件映射路径')
    new_file_name: Optional[str] = Field(default=None, description='新文件名称')
    original_filename: Optional[str] = Field(default=None, description='原文件名称')
    url: Optional[str] = Field(default=None, description='新文件url')
