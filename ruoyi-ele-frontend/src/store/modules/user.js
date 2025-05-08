/**
 * 登录用户状态管理
 */
import { defineStore } from 'pinia';
import { mapTree, isExternalLink, toTree } from 'ele-admin-plus/es';
import { getUserInfo, getUserMenu } from '@/api/layout';
import { API_BASE_URL } from '@/config/setting';

/** 直接指定菜单数据 */
const USER_MENUS = null;

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 当前登录用户的信息 */
    info: null,
    /** 当前登录用户的菜单 */
    menus: null,
    /** 当前登录用户的权限 */
    authorities: [],
    /** 当前登录用户的角色 */
    roles: [],
    /** 字典数据缓存 */
    dicts: {}
  }),
  actions: {
    /**
     * 请求登录用户的个人信息/权限/角色/菜单
     */
    async fetchUserInfo() {
      const result = await getUserInfo().catch((e) => console.error(e));
      if (!result) {
        return {};
      }
      // 用户信息
      this.setInfo(result.user);
      // 用户权限
      this.authorities = result.permissions;
      // 用户角色
      this.roles = result.roles;
      // 用户菜单
      const userMenu = await getUserMenu().catch((e) => console.error(e));

      const { menus, homePath } = formatMenus(
        USER_MENUS ??
          toTree({
            data: userMenu?.filter?.((d) => d.menuType !== 1),
            idField: 'menuId',
            parentIdField: 'parentId'
          })
      );
      this.setMenus(menus);
      return { menus, homePath };
    },
    /**
     * 更新用户信息
     */
    setInfo(data) {
      if (data) {
        if (!data.avatar) {
          data.avatar = 'https://cdn.eleadmin.com/20200610/avatar.jpg';
        } else if (!isExternalLink(data.avatar)) {
          data.avatar = API_BASE_URL + data.avatar;
        }
      }
      this.info = data || {};
    },
    /**
     * 更新菜单数据
     */
    setMenus(menus) {
      this.menus = menus;
    },
    /**
     * 更新菜单的徽章
     * @param path 菜单地址
     * @param value 徽章值
     * @param type 徽章类型
     */
    setMenuBadge(path, value, type) {
      this.menus = mapTree(this.menus, (m) => {
        if (path === m.path) {
          const meta = m.meta || {};
          return {
            ...m,
            meta: {
              ...meta,
              props: {
                ...meta.props,
                badge: value == null ? void 0 : { value, type }
              }
            }
          };
        }
        return m;
      });
    },
    /**
     * 更新字典数据
     */
    setDicts(value, code) {
      if (code == null) {
        this.dicts = value;
        return;
      }
      this.dicts[code] = value;
    }
  }
});

/**
 * 菜单数据处理为EleProLayout所需要的格式
 * @param data 菜单数据
 * @param childField 子级的字段名称
 */
function formatMenus(data, childField = 'children') {
  let homePath;
  let homeTitle;
  const menus = mapTree(
    data,
    (item) => {
      const meta =
        typeof item.meta === 'string'
          ? JSON.parse(item.meta || '{}')
          : item.meta;
      const menu = {
        path: item.path,
        component: item.component,
        meta: { title: item.title, icon: item.icon, hide: !!item.hide, ...meta }
      };
      const children = item[childField]
        ? item[childField].filter((d) => !(d.meta?.hide ?? d.hide))
        : void 0;
      if (!children?.length) {
        if (!homePath && menu.path && !isExternalLink(menu.path)) {
          homePath = menu.path;
          homeTitle = menu.meta?.title;
        }
      } else {
        const childPath = children[0].path;
        if (childPath) {
          if (!menu.redirect) {
            menu.redirect = childPath;
          }
          if (!menu.path) {
            menu.path = childPath.substring(0, childPath.lastIndexOf('/'));
          }
        }
      }
      if (!menu.path) {
        console.error('菜单path不能为空且要唯一:', item);
        return;
      }
      return menu;
    },
    childField
  );
  return { menus, homePath, homeTitle };
}
