import request from '@/utils/request';
import { download, toFormData, toURLSearch } from '@/utils/common';

/**
 * 分页查询定时任务
 */
export async function pageJobs(params) {
  const res = await request.get('/monitor/job/list?' + toURLSearch(params));
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 添加定时任务
 */
export async function addJob(data) {
  const res = await request.post('/monitor/job', data);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 修改定时任务
 */
export async function updateJob(data) {
  const res = await request.put('/monitor/job', data);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 删除定时任务
 */
export async function removeJob(id) {
  const res = await request.delete('/monitor/job/' + id);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 批量删除定时任务
 */
export async function removeJobs(ids) {
  const res = await request.delete('/monitor/job/' + ids.join());
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 修改定时任务状态
 */
export async function updateJobStatus(job_id, status) {
  const res = await request.put('/monitor/job/changeStatus', {
    job_id,
    status
  });
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 导出定时任务列表
 */
export async function exportJobs(params) {
  const res = await request({
    url: '/monitor/job/export',
    method: 'POST',
    data: toFormData(params),
    responseType: 'blob'
  });
  download(res.data, `job_${new Date().getTime()}.xlsx`);
}

/**
 * 执行定时任务
 */
export async function runJob(job_id, job_group) {
  const res = await request.put('/monitor/job/run', {
    job_id,
    job_group
  });
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}
