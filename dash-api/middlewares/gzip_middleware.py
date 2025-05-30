# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  middlewares/gzip_middleware.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware


def add_gzip_middleware(app: FastAPI):
    """
    添加gzip压缩中间件

    :param app: FastAPI对象
    :return:
    """
    app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=9)
