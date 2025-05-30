# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  liuyue <yshan2028@gmail.com>
@Version        :  V1.0.0
------------------------------------
@File           :  module_admin/entity/do/post_do.py
@Description    :  
@CreateTime     :  2025/05/30 22:33
@Project        :  RuoYi-Vue3-FastAPI
@Repository     :  https://github.com/yshan2028/RuoYi-Vue3-FastAPI
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 22:43
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from config.database import Base


class SysPost(Base):
    """
    岗位信息表
    """

    __tablename__ = 'sys_post'

    post_id = Column(Integer, primary_key=True, autoincrement=True, comment='岗位ID')
    post_code = Column(String(64), nullable=False, comment='岗位编码')
    post_name = Column(String(50), nullable=False, comment='岗位名称')
    post_sort = Column(Integer, nullable=False, comment='显示顺序')
    status = Column(String(1), nullable=False, default='0', comment='状态（0正常 1停用）')
    del_flag = Column(String(1), default='0', comment='删除标志（0代表存在 2代表删除）')
    create_by = Column(String(64), default='', comment='创建者')
    create_time = Column(DateTime, nullable=True, default=datetime.now(), comment='创建时间')
    update_by = Column(String(64), default='', comment='更新者')
    update_time = Column(DateTime, nullable=True, default=datetime.now(), comment='更新时间')
    remark = Column(String(500), nullable=True, default=None, comment='备注')
