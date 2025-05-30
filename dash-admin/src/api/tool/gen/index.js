import request from '@/utils/request';
import { download, toFormData, checkDownloadRes } from '@/utils/common';
import {
  getTemplateData,
  templateEngine,
  indexTemplate,
  searchTemplate,
  editTemplate,
  apiTemplate,
  indexTreeTemplate,
  editTreeTemplate,
  editSubTemplate
} from '@/views/tool/gen/components/gen-util';
import JSZip from 'jszip';

/**
 * 分页查询代码生成
 */
export async function pageGens(params) {
  const res = await request.get('/tool/gen/list', { params });
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 修改代码生成
 */
export async function updateGen(data) {
  const res = await request.put('/tool/gen', data);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 删除代码生成
 */
export async function removeGen(id) {
  const res = await request.delete('/tool/gen/' + id);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 批量删除代码生成
 */
export async function removeGens(ids) {
  const res = await request.delete('/tool/gen/' + ids.join());
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 分页查询可导入的表
 */
export async function pageGenDbs(params) {
  const res = await request.get('/tool/gen/db/list', { params });
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 导入表
 */
export async function importTables(data) {
  const res = await request.post('/tool/gen/importTable', toFormData(data));
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 同步表
 */
export async function synchDb(name) {
  const res = await request.get('/tool/gen/synchDb/' + name);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 生成到自定义路径
 */
export async function genCode(name) {
  const res = await request.get('/tool/gen/genCode/' + name);
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 生成为zip
 */
export async function genCodeZip(params) {
  const res = await request({
    url: '/tool/gen/batchGenCode',
    method: 'GET',
    params: params,
    responseType: 'blob'
  });
  await checkDownloadRes(res);
  download(res.data, `ruoyi_${Date.now()}.zip`);
}

/**
 * 预览代码
 */
export async function previewCode(id) {
  const res = await request.get('/tool/gen/preview/' + id);
  if (res.data.code === 200 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 查询代码生成详情
 */
export async function getGenTable(id) {
  const res = await request.get('/tool/gen/' + id);
  if (res.data.code === 200 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 创建表
 */
export async function createTable(sql) {
  const res = await request.post('/tool/gen/createTable', toFormData({ sql }));
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 预览代码(含生成前端代码)
 */
export async function previewCodePro(id) {
  const [previewRes, genRes] = await Promise.all([
    previewCode(id),
    getGenTable(id)
  ]);
  //
  const { className, packageName, tplCategory } = genRes.info;
  const packagePath = packageName.replace(/\./g, '/');
  const domainFiles = [
    {
      key: `back/src/main/java/${packagePath}/domain/${className}.java`,
      label: `${className}.java`,
      meta: {
        language: 'java',
        text: previewRes['vm/java/domain.java.vm'],
        path: `src/main/java/${packagePath}/domain/${className}.java`
      }
    }
  ];
  const subDomain = previewRes['vm/java/sub-domain.java.vm'];
  if (subDomain) {
    const start = 'public class ';
    const subDomainName = subDomain.substring(
      subDomain.indexOf(start) + start.length,
      subDomain.indexOf(' extends BaseEntity')
    );
    domainFiles.push({
      key: `back/src/main/java/${packagePath}/domain/${subDomainName}.java`,
      label: `${subDomainName}.java`,
      meta: {
        language: 'java',
        text: subDomain,
        path: `src/main/java/${packagePath}/domain/${subDomainName}.java`
      }
    });
  }
  //
  const templateData = getTemplateData(genRes);
  const { modelName, moduleName } = templateData;
  return [
    {
      key: 'front/src',
      label: '前端/src',
      children: [
        {
          key: `front/src/api/${moduleName}/${modelName}`,
          label: `api/${moduleName}/${modelName}`,
          children: [
            {
              key: `front/src/api/${moduleName}/${modelName}/index.js`,
              label: 'index.js',
              meta: {
                language: 'js',
                text: templateEngine(apiTemplate, templateData),
                path: `src/api/${moduleName}/${modelName}/index.js`
              }
            }
          ]
        },
        {
          key: `front/src/views/${moduleName}/${modelName}`,
          label: `views/${moduleName}/${modelName}`,
          children: [
            {
              key: `front/src/views/${moduleName}/${modelName}/components`,
              label: 'components',
              children: [
                {
                  key: `front/src/views/${moduleName}/${modelName}/components/${modelName}-edit.vue`,
                  label: `${modelName}-edit.vue`,
                  meta: {
                    language: 'vue',
                    text: templateEngine(
                      tplCategory === 'tree'
                        ? editTreeTemplate
                        : tplCategory === 'sub'
                          ? editSubTemplate
                          : editTemplate,
                      templateData
                    ),
                    path: `src/views/${moduleName}/${modelName}/components/${modelName}-edit.vue`
                  }
                },
                {
                  key: `front/src/views/${moduleName}/${modelName}/components/${modelName}-search.vue`,
                  label: `${modelName}-search.vue`,
                  meta: {
                    language: 'vue',
                    text: templateEngine(searchTemplate, templateData),
                    path: `src/views/${moduleName}/${modelName}/components/${modelName}-search.vue`
                  }
                }
              ]
            },
            {
              key: `front/src/views/${moduleName}/${modelName}/index.vue`,
              label: 'index.vue',
              meta: {
                language: 'vue',
                text: templateEngine(
                  tplCategory === 'tree' ? indexTreeTemplate : indexTemplate,
                  templateData
                ),
                path: `src/views/${moduleName}/${modelName}/index.vue`
              }
            }
          ]
        }
      ]
    },
    {
      key: 'back/src/main',
      label: '后端/src/main',
      children: [
        {
          key: `back/src/main/java/${packagePath}`,
          label: `java/${packagePath}`,
          children: [
            {
              key: `back/src/main/java/${packagePath}/controller`,
              label: `controller`,
              children: [
                {
                  key: `back/src/main/java/${packagePath}/controller/${className}Controller.java`,
                  label: `${className}Controller.java`,
                  meta: {
                    language: 'java',
                    text: previewRes['vm/java/controller.java.vm'],
                    path: `src/main/java/${packagePath}/controller/${className}Controller.java`
                  }
                }
              ]
            },
            {
              key: `back/src/main/java/${packagePath}/domain`,
              label: `domain`,
              children: domainFiles
            },
            {
              key: `back/src/main/java/${packagePath}/mapper`,
              label: `mapper`,
              children: [
                {
                  key: `back/src/main/java/${packagePath}/mapper/${className}Mapper.java`,
                  label: `${className}Mapper.java`,
                  meta: {
                    language: 'java',
                    text: previewRes['vm/java/mapper.java.vm'],
                    path: `src/main/java/${packagePath}/mapper/${className}Mapper.java`
                  }
                }
              ]
            },
            {
              key: `back/src/main/java/${packagePath}/service`,
              label: `service`,
              children: [
                {
                  key: `back/src/main/java/${packagePath}/service/impl`,
                  label: 'impl',
                  children: [
                    {
                      key: `back/src/main/java/${packagePath}/service/impl/${className}ServiceImpl.java`,
                      label: `${className}ServiceImpl.java`,
                      meta: {
                        language: 'java',
                        text: previewRes['vm/java/serviceImpl.java.vm'],
                        path: `src/main/java/${packagePath}/service/impl/${className}ServiceImpl.java`
                      }
                    }
                  ]
                },
                {
                  key: `back/src/main/java/${packagePath}/service/I${className}Service.java`,
                  label: `I${className}Service.java`,
                  meta: {
                    language: 'java',
                    text: previewRes['vm/java/service.java.vm'],
                    path: `src/main/java/${packagePath}/service/I${className}Service.java`
                  }
                }
              ]
            }
          ]
        },
        {
          key: 'back/src/main/resources/mapper/system',
          label: `resources/mapper/system`,
          children: [
            {
              key: `back/src/main/resources/mapper/system/${className}Mapper.xml`,
              label: `${className}Mapper.xml`,
              meta: {
                language: 'xml',
                text: previewRes['vm/xml/mapper.xml.vm'],
                path: `src/main/resources/mapper/system/${className}Mapper.xml`
              }
            }
          ]
        }
      ]
    },
    {
      key: 'sql',
      label: '数据库',
      children: [
        {
          key: 'sql/sys_menu.sql',
          label: `${modelName}Menu.sql`,
          meta: {
            language: 'sql',
            text: previewRes['vm/sql/sql.vm'],
            path: 'sys_menu.sql'
          }
        }
      ]
    }
  ];
}

/**
 * 生成为zip
 */
export async function genCodeZipPro(params, tableIds) {
  const res = await request({
    url: '/tool/gen/batchGenCode',
    method: 'GET',
    params: params,
    responseType: 'blob'
  });
  await checkDownloadRes(res);
  const zip = new JSZip();
  await zip.loadAsync(res.data, {});
  const genList = await Promise.all(
    [...tableIds].reverse().map((id) => getGenTable(id))
  );
  genList.forEach((genRes) => {
    const { tplCategory } = genRes.info;
    const templateData = getTemplateData(genRes);
    const { modelName, moduleName } = templateData;
    zip.file(
      `ele-admin/api/${moduleName}/${modelName}/index.js`,
      templateEngine(apiTemplate, templateData)
    );
    zip.file(
      `ele-admin/views/${moduleName}/${modelName}/components/${modelName}-edit.vue`,
      templateEngine(
        tplCategory === 'tree'
          ? editTreeTemplate
          : tplCategory === 'sub'
            ? editSubTemplate
            : editTemplate,
        templateData
      )
    );
    zip.file(
      `ele-admin/views/${moduleName}/${modelName}/components/${modelName}-search.vue`,
      templateEngine(searchTemplate, templateData)
    );
    zip.file(
      `ele-admin/views/${moduleName}/${modelName}/index.vue`,
      templateEngine(
        tplCategory === 'tree' ? indexTreeTemplate : indexTemplate,
        templateData
      )
    );
  });
  const data = await zip.generateAsync({ type: 'blob' });
  download(data, `ruoyi_${Date.now()}.zip`);
}
