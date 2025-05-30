import request from '@/utils/request';
import { download, toFormData, checkDownloadRes } from '@/utils/common';

/**
 * 分页查询操作日志
 */
export async function pageOperlogs(params) {
  const res = await request.get('/monitor/operlog/list', { params });
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 导出操作日志
 */
export async function exportOperlogs(params) {
  const res = await request({
    url: '/monitor/operlog/export',
    method: 'POST',
    data: toFormData(params),
    responseType: 'blob'
  });
  await checkDownloadRes(res);
  download(res.data, `operlog_${Date.now()}.xlsx`);
}

/**
 * 批量删除操作日志
 */
export async function removeOperlogs(ids) {
  const res = await request.delete('/monitor/operlog/' + ids.join());
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 清空操作日志
 */
export async function clearOperlogs() {
  const res = await request.delete('/monitor/operlog/clean');
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}
