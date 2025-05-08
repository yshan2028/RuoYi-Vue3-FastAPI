import request from '@/utils/request';
import { toFormData } from '@/utils/common';
/**
 * 获取当前登录用户的个人信息/权限/角色
 */
export async function getUserInfo() {
  const res = await request.get('/getInfo');
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 获取当前登录用户的菜单
 */
export async function getUserMenu() {
  const res = await request.get('/getRouters');
  if (res.data.code === 200 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 修改当前登录用户的密码
 */
export async function updatePassword(data) {
  const res = await request.put(
    '/system/user/profile/updatePwd',
    toFormData(data)
  );
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/** 若依默认菜单图标名称 */
export const ruoYiIcons = {
  system: 'IconProSettingOutlined',
  user: 'IconProUserOutlined',
  peoples: 'IconProIdcardOutlined',
  'tree-table': 'IconProAppstoreOutlined',
  tree: 'IconProCityOutlined',
  post: 'IconProSuitcaseOutlined',
  dict: 'IconProBookOutlined',
  edit: 'IconProControlOutlined',
  message: 'IconProMessageOutlined',
  log: 'IconProLogOutlined',
  form: 'IconProFileOutlined',
  logininfor: 'IconProCalendarOutlined',
  monitor: 'IconProDashboardOutlined',
  online: 'IconProConnectionOutlined',
  job: 'IconProTimerOutlined',
  druid: 'IconProFundOutlined',
  server: 'IconProAnalysisOutlined',
  redis: 'IconProClusterOutlined',
  'redis-list': 'IconProDatabaseOutlined',
  tool: 'IconProAppstoreAddOutlined',
  build: 'IconProFormOutlined',
  code: 'IconProCodeOutlined',
  swagger: 'IconProLinkOutlined',
  guide: 'IconProLinkOutlined',
  '#': 'IconProLinkOutlined'
};
