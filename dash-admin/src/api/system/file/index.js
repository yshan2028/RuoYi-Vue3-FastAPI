import request from '@/utils/request';

/**
 * 上传文件
 * @param file 文件
 * @param config 请求配置
 * @param fileName 文件名称
 */
export async function uploadFile(file, config, fileName) {
  const formData = new FormData();
  formData.append('file', file, fileName);
  const res = await request.post('/common/upload', formData, config);
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 分页查询用户文件
 */
export async function pageUserFiles(params) {
  console.log('pageUserFiles:', params);
  return {
    list: [
      {
        id: 170,
        name: 'RZ8FQmZfHkcffMlTBCJllBFjEhEsObVo.jpg',
        isDirectory: 0,
        length: 38206,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:40',
        url: 'https://v2.eleadmin.com/api/file/20220722/099d2f77dfad41c7af776ad81af7aab5.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/099d2f77dfad41c7af776ad81af7aab5.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/099d2f77dfad41c7af776ad81af7aab5.jpg'
      },
      {
        id: 171,
        name: 'WLXm7gp1EbLDtvVQgkeQeyq5OtDm00Jd.jpg',
        isDirectory: 0,
        length: 60365,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:41',
        url: 'https://v2.eleadmin.com/api/file/20220722/faf7fec118824f309fb66961866d9712.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/faf7fec118824f309fb66961866d9712.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/faf7fec118824f309fb66961866d9712.jpg'
      },
      {
        id: 172,
        name: '4Z0QR2L0J1XStxBh99jVJ8qLfsGsOgjU.jpg',
        isDirectory: 0,
        length: 50118,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:42',
        url: 'https://v2.eleadmin.com/api/file/20220722/d845f1a4e91143dc81ec9fa96ce6f074.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/d845f1a4e91143dc81ec9fa96ce6f074.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/d845f1a4e91143dc81ec9fa96ce6f074.jpg'
      },
      {
        id: 173,
        name: 'ttkIjNPlVDuv4lUTvRX8GIlM2QqSe0jg.jpg',
        isDirectory: 0,
        length: 29948,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:42',
        url: 'https://v2.eleadmin.com/api/file/20220722/4fc98decedcb4029bc954369c5e8c294.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/4fc98decedcb4029bc954369c5e8c294.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/4fc98decedcb4029bc954369c5e8c294.jpg'
      },
      {
        id: 174,
        name: 'fAenQ8nvRjL7x0i0jEfuDBZHvJfHf3v6.jpg',
        isDirectory: 0,
        length: 48228,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:43',
        url: 'https://v2.eleadmin.com/api/file/20220722/9787d2f5b37d4813a48b72e950d00395.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/9787d2f5b37d4813a48b72e950d00395.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/9787d2f5b37d4813a48b72e950d00395.jpg'
      },
      {
        id: 175,
        name: 'LrCTN2j94lo9N7wEql7cBr1Ux4rHMvmZ.jpg',
        isDirectory: 0,
        length: 37320,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:43',
        url: 'https://v2.eleadmin.com/api/file/20220722/9dacd9d48efa483ab204ae8ad0b60864.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/9dacd9d48efa483ab204ae8ad0b60864.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/9dacd9d48efa483ab204ae8ad0b60864.jpg'
      },
      {
        id: 176,
        name: 'yeKvhT20lMU0f1T3Y743UlGEOLLnZSnp.jpg',
        isDirectory: 0,
        length: 29040,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:44',
        url: 'https://v2.eleadmin.com/api/file/20220722/f74da7fd19524bc0a4e75e6159d041ac.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/f74da7fd19524bc0a4e75e6159d041ac.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/f74da7fd19524bc0a4e75e6159d041ac.jpg'
      },
      {
        id: 177,
        name: 'CyrCNmTJfv7D6GFAg39bjT3eRkkRm5dI.jpg',
        isDirectory: 0,
        length: 39560,
        contentType: 'image/jpeg',
        updateTime: '2022-07-22 16:08:45',
        url: 'https://v2.eleadmin.com/api/file/20220722/7539f0f90c4749cbbb56b111e2b8d6af.jpg',
        thumbnail:
          'https://v2.eleadmin.com/api/file/thumbnail/20220722/7539f0f90c4749cbbb56b111e2b8d6af.jpg',
        downloadUrl:
          'https://v2.eleadmin.com/api/file/download/20220722/7539f0f90c4749cbbb56b111e2b8d6af.jpg'
      },
      {
        id: 209,
        name: '745cbbaa15464f6c191a10a4c7fb9a30.mp4',
        isDirectory: 0,
        path: 'https://tianyu.v.netease.com/2024/0617/745cbbaa15464f6c191a10a4c7fb9a30.mp4',
        length: 139005355,
        contentType: 'video/mp4',
        updateTime: '2024-08-24 23:56:52',
        url: 'https://tianyu.v.netease.com/2024/0617/745cbbaa15464f6c191a10a4c7fb9a30.mp4',
        thumbnail: null,
        downloadUrl:
          'https://tianyu.v.netease.com/2024/0617/745cbbaa15464f6c191a10a4c7fb9a30.mp4'
      },
      {
        id: 210,
        name: 'xjy_1080p.mp4',
        isDirectory: 0,
        length: 126041451,
        contentType: 'video/mp4',
        updateTime: '2024-08-25 00:00:44',
        url: 'https://n.v.netease.com/2017/1212_erce/xjy_1080p.mp4',
        thumbnail: null,
        downloadUrl: 'https://n.v.netease.com/2017/1212_erce/xjy_1080p.mp4'
      }
    ],
    count: 10
  };
}

/**
 * 查询用户文件列表
 */
export async function listUserFiles(params) {
  console.log('listUserFiles:', params);
  return [
    {
      id: 158,
      name: '我的文件',
      parentId: 0
    }
  ];
}

/**
 * 添加用户文件
 */
export async function addUserFile(data) {
  console.log('addUserFile:', data);
  return Promise.reject(new Error('没有访问权限'));
}

/**
 * 修改用户文件
 */
export async function updateUserFile(data) {
  console.log('updateUserFile:', data);
  return Promise.reject(new Error('没有访问权限'));
}

/**
 * 删除用户文件
 */
export async function removeUserFile(id) {
  console.log('removeUserFile:', id);
  return Promise.reject(new Error('没有访问权限'));
}
