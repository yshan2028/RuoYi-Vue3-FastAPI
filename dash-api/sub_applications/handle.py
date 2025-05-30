# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  sub_applications/handle.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

from fastapi import FastAPI
from sub_applications.staticfiles import mount_staticfiles


def handle_sub_applications(app: FastAPI):
    """
    全局处理子应用挂载
    """
    # 挂载静态文件
    mount_staticfiles(app)
