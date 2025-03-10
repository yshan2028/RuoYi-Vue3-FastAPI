from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from config.constant import CommonConstant, MenuConstant
from exceptions.exception import ServiceException, ServiceWarning
from module_admin.dao.menu_dao import MenuDao
from module_admin.dao.role_dao import RoleDao
from module_admin.entity.vo.common_vo import CrudResponseModel
from module_admin.entity.vo.menu_vo import DeleteMenuModel, MenuQueryModel, MenuModel
from module_admin.entity.vo.role_vo import RoleMenuQueryModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from utils.common_util import SqlalchemyUtil
from utils.string_util import StringUtil


class MenuService:
    """
    菜单管理模块服务层
    """

    @classmethod
    async def get_menu_tree_services(cls, query_db: AsyncSession, current_user: Optional[CurrentUserModel] = None):
        """
        获取菜单树信息service

        :param query_db: orm对象
        :param current_user: 当前用户对象
        :return: 菜单树信息对象
        """
        menu_list_result = await MenuDao.get_menu_list_for_tree(
            query_db, current_user.user.user_id, current_user.user.role
        )
        menu_tree_result = cls.list_to_tree(menu_list_result)

        return menu_tree_result

    @classmethod
    async def get_role_menu_tree_services(
            cls, query_db: AsyncSession, role_id: int, current_user: Optional[CurrentUserModel] = None
    ):
        """
        根据角色id获取菜单树信息service

        :param query_db: orm对象
        :param role_id: 角色id
        :param current_user: 当前用户对象
        :return: 当前角色id的菜单树信息对象
        """
        # 查询当前用户有权限的菜单列表
        menu_list_result = await MenuDao.get_menu_list_for_tree(
            query_db, current_user.user.user_id, current_user.user.role
        )
        menu_tree_result = cls.list_to_tree(menu_list_result)

        # 查询当前角色的详细信息
        role = await RoleDao.get_role_detail_by_id(query_db, role_id)
        if not role:
            raise ValueError("角色不存在")

        # 获取角色对应的菜单权限
        role_menu_list = await RoleDao.get_role_menu_dao(query_db, role)
        checked_keys = [row.menu_id for row in role_menu_list]

        # 组装数据
        result = RoleMenuQueryModel(menus=menu_tree_result, checked_keys=checked_keys)

        return result

    @classmethod
    async def get_menu_list_services( cls, query_db: AsyncSession, page_object: MenuQueryModel, current_user: Optional[CurrentUserModel] = None):
        """
        获取菜单列表信息service

        :param query_db: orm对象
        :param page_object: 分页查询参数对象
        :param current_user: 当前用户对象
        :return: 菜单列表信息对象
        """
        menu_list_result = await MenuDao.get_menu_list(
            query_db, page_object, current_user.user.user_id, current_user.user.role
        )

        menu_list = SqlalchemyUtil.serialize_result(menu_list_result)
        for menu in menu_list:
            if "meta" in menu:
                menu["meta"] = MenuModel(meta=menu["meta"]).get_meta_as_json_string()

        return menu_list

    @classmethod
    async def check_title_unique_services(cls, query_db: AsyncSession, page_object: MenuModel):
        """
        校验菜单名称是否唯一service

        :param query_db: orm对象
        :param page_object: 菜单对象
        :return: 校验结果
        """
        menu_id = -1 if page_object.menu_id is None else page_object.menu_id
        menu = await MenuDao.get_menu_detail_by_info(query_db, MenuModel(title=page_object.title))
        if menu and menu.menu_id != menu_id:
            return CommonConstant.NOT_UNIQUE
        return CommonConstant.UNIQUE

    @classmethod
    async def add_menu_services(cls, query_db: AsyncSession, page_object: MenuModel):
        """
        新增菜单信息service

        :param query_db: orm对象
        :param page_object: 新增菜单对象
        :return: 新增菜单校验结果
        """
        if not await cls.check_title_unique_services(query_db, page_object):
            raise ServiceException(message=f'新增菜单 "{page_object.title}" 失败，菜单名称已存在')

        if page_object.is_frame == "1" and not StringUtil.is_http(page_object.component):
            raise ServiceException(message=f'新增菜单 "{page_object.title}" 失败，外链组件地址必须以 http(s):// 开头')

        page_object.set_meta_as_json()

        try:
            await MenuDao.add_menu_dao(query_db, page_object)
            await query_db.commit()
            return CrudResponseModel(is_success=True, message='新增成功')
        except Exception as e:
            await query_db.rollback()
            raise e

    @classmethod
    async def edit_menu_services(cls, query_db: AsyncSession, page_object: MenuModel):
        """
        编辑菜单信息service

        :param query_db: orm对象
        :param page_object: 编辑部门对象
        :return: 编辑菜单校验结果
        """
        edit_menu = page_object.model_dump(exclude_unset=True)
        menu_info = await cls.menu_detail_services(query_db, page_object.menu_id)

        if not menu_info.menu_id:
            raise ServiceException(message='菜单不存在')

        if not await cls.check_title_unique_services(query_db, page_object):
            raise ServiceException(message=f'修改菜单 "{page_object.title}" 失败，菜单名称已存在')

        if page_object.is_frame == "1" and not StringUtil.is_http(page_object.component):
            raise ServiceException(message=f'修改菜单 "{page_object.title}" 失败，外链组件地址必须以 http(s):// 开头')

        if page_object.menu_id == page_object.parent_id:
            raise ServiceException(message=f'修改菜单 "{page_object.title}" 失败，上级菜单不能选择自己')

        page_object.set_meta_as_json()

        try:
            await MenuDao.edit_menu_dao(query_db, edit_menu)
            await query_db.commit()
            return CrudResponseModel(is_success=True, message='更新成功')
        except Exception as e:
            await query_db.rollback()
            raise e

    @classmethod
    async def delete_menu_services(cls, query_db: AsyncSession, page_object: DeleteMenuModel):
        """
        删除菜单信息service

        :param query_db: orm对象
        :param page_object: 删除菜单对象
        :return: 删除菜单校验结果
        """
        if not page_object.menu_ids:
            raise ServiceException(message='传入菜单ID为空')

        menu_id_list = page_object.menu_ids.split(',')

        try:
            for menu_id in menu_id_list:
                if (await MenuDao.has_child_by_menu_id_dao(query_db, int(menu_id))) > 0:
                    raise ServiceWarning(message='存在子菜单，不允许删除')

                if (await MenuDao.check_menu_exist_role_dao(query_db, int(menu_id))) > 0:
                    raise ServiceWarning(message='菜单已分配，不允许删除')

                await MenuDao.delete_menu_dao(query_db, MenuModel(menu_id=menu_id))

            await query_db.commit()
            return CrudResponseModel(is_success=True, message='删除成功')
        except Exception as e:
            await query_db.rollback()
            raise e

    @classmethod
    async def menu_detail_services(cls, query_db: AsyncSession, menu_id: int):
        """
        获取菜单详细信息service

        :param query_db: orm对象
        :param menu_id: 菜单id
        :return: 菜单id对应的信息
        """
        menu = await MenuDao.get_menu_detail_by_id(query_db, menu_id=menu_id)
        if menu:
            menu_dict = SqlalchemyUtil.serialize_result(menu)

            if "meta" in menu_dict:
                menu_dict["meta"] = MenuModel(meta=menu_dict["meta"]).get_meta_as_json_string()

            return MenuModel(**menu_dict)
        return MenuModel(**dict())

    @classmethod
    def list_to_tree(cls, permission_list: list) -> list:
        """
        工具方法：根据菜单列表信息生成树形嵌套数据

        :param permission_list: 菜单列表信息
        :return: 菜单树形嵌套数据
        """
        permission_list = [
            dict(id=str(item.menu_id), label=item.title, value=str(item.menu_id), parent_id=str(item.parent_id))
            for item in permission_list
        ]
        # 转成id为key的字典
        mapping: dict = dict(zip([i['id'] for i in permission_list], permission_list))

        # 树容器
        container: list = []

        for d in permission_list:
            # 如果找不到父级项，则是根节点
            parent: dict = mapping.get(d['parent_id'])
            if parent is None:
                container.append(d)
            else:
                children: list = parent.get('children')
                if not children:
                    children = []
                children.append(d)
                parent.update({'children': children})

        return container
