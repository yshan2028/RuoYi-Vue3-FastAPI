import { download } from '@/utils/common';
export { templateEngine } from 'ele-admin-plus/es/ele-pro-form-builder/components/code-util';

/**
 * 页面生成模板
 */
export const indexTemplate = `<template>
  <ele-page>
    <!-- 搜索表单 -->
    <<% d.modelName %>-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="<% d.primaryKey %>"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        :highlight-current-row="true"
        :export-config="{ fileName: '<% d.modelText %>' }"
        cache-key="<% d.tableCacheKey %>"
      >
        <template #toolbar>
          <el-button
            v-permission="'<% d.moduleName %>:<% d.modelName %>:add'"
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            v-permission="'<% d.moduleName %>:<% d.modelName %>:remove'"
            type="danger"
            class="ele-btn-icon"
            :icon="DeleteOutlined"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button
            v-permission="'<% d.moduleName %>:<% d.modelName %>:export'"
            class="ele-btn-icon"
            :icon="DownloadOutlined"
            @click="exportData"
          >
            导出
          </el-button>
        </template>
        <template #action="{ row }">
          <el-link
            v-permission="'<% d.moduleName %>:<% d.modelName %>:edit'"
            type="primary"
            :underline="false"
            @click="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider
            v-permission="['<% d.moduleName %>:<% d.modelName %>:edit', '<% d.moduleName %>:<% d.modelName %>:remove']"
            direction="vertical"
          />
          <el-link
            v-permission="'<% d.moduleName %>:<% d.modelName %>:remove'"
            type="danger"
            :underline="false"
            @click="removeBatch(row)"
          >
            删除
          </el-link>
        </template><%# d.columns.forEach(function(item){if(item.dictType){ %>
        <template #<% item.prop %>="{ row }">
          <dict-data
            code="<% item.dictType %>"
            type="tag"
            :model-value="row.<% item.prop %>"
          />
        </template><%# }}); %>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <<% d.modelName %>-edit v-model="showEdit" :data="current" @done="reload" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import {
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined
  } from '@/components/icons';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import <% d.modelTypeName %>Search from './components/<% d.modelName %>-search.vue';
  import <% d.modelTypeName %>Edit from './components/<% d.modelName %>-edit.vue';
  import { page<% d.modelTypeName %>s, remove<% d.modelTypeName %>s, export<% d.modelTypeName %>s } from '@/api/<% d.moduleName %>/<% d.modelName %>';

  defineOptions({ name: '<% d.moduleTypeName %><% d.modelTypeName %>' });

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center',
      fixed: 'left'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center',
      fixed: 'left'
    }<%# d.columns.forEach(function(item){ %>,
    {
      prop: '<% item.prop %>',
      label: '<% item.label %>',
      align: 'center',
      minWidth: 110<%# if(item.dictType){ %>,
      slot: '<% item.prop %>'<%# } %>
    }<%# }); %>,
    {
      columnKey: 'action',
      label: '操作',
      width: 180,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where }) => {
    return page<% d.modelTypeName %>s({ ...where, ...pages });
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ page: 1, where });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row) => {
    current.value = row ?? null;
    showEdit.value = true;
  };

  /** 批量删除 */
  const removeBatch = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    ElMessageBox.confirm(
      \`是否确认删除<% d.delTipName %>为"\${rows.map((d) => d.<% d.delTipKey %>).join()}"的数据项?\`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        remove<% d.modelTypeName %>s(rows.map((d) => d.<% d.primaryKey %>))
          .then(() => {
            loading.close();
            EleMessage.success('删除成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 导出数据 */
  const exportData = () => {
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
    tableRef.value?.fetch?.(({ where }) => {
      export<% d.modelTypeName %>s(where)
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    });
  };
</script>
`;

/**
 * 搜索表单生成模板
 */
export const searchTemplate = `<!-- 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8"><%# d.queryForm.forEach(function(item){ %>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="<% item.label %>">
            <%# if(item.dictType){ %><dict-data
              code="<% item.dictType %>"
              v-model="form.<% item.prop %>"
              placeholder="请选择"
            /><%# }else{ %><el-input
              clearable
              v-model.trim="form.<% item.prop %>"
              placeholder="请输入"
            /><%# } %>
          </el-form-item>
        </el-col><%# }); %>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label-width="16px">
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </ele-card>
</template>

<script setup>
  import { useFormData } from '@/utils/use-form-data';

  const emit = defineEmits(['search']);

  /** 表单数据 */
  const [form, resetFields] = useFormData({<%# d.queryForm.forEach(function(item,i){ %>
    <% item.prop %>: <% item.isString ? "''" : 'void 0' %><% i === (d.queryForm.length - 1) ? '' : ',' %><%# }); %>
  });

  /** 搜索 */
  const search = () => {
    emit('search', { ...form });
  };

  /**  重置 */
  const reset = () => {
    resetFields();
    search();
  };
</script>
`;

/**
 * 编辑弹窗生成模板
 */
export const editTemplate = `<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="460"
    v-model="visible"
    :title="isUpdate ? '修改<% d.modelText %>' : '添加<% d.modelText %>'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    ><%# d.editForm.forEach(function(item){ %>
      <el-form-item label="<% item.label %>" prop="<% item.prop %>">
        <%# if(item.dictType){ %><dict-data
          code="<% item.dictType %>"<%# if(['radio','checkbox'].includes(item.formType)){ %>
          type="<% item.formType %>"<%# } %>
          v-model="form.<% item.prop %>"
        /><%# }else if(item.formType==='textarea'){ %><el-input
          :rows="4"
          type="textarea"
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# }else if(item.formType==='datetime'){ %><el-date-picker
          v-model="form.<% item.prop %>"
          value-format="YYYY-MM-DD"
          placeholder="请选择<% item.label %>"
          class="ele-fluid"
        /><%# }else{ %><el-input
          clearable
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# } %>
      </el-form-item><%# }); %>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import { add<% d.modelTypeName %>, update<% d.modelTypeName %> } from '@/api/<% d.moduleName %>/<% d.modelName %>';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    <% d.primaryKey %>: void 0<%# d.editForm.forEach(function(item){ %>,
    <% item.prop %>: <% item.isString ? "''" : 'void 0' %><%# }); %>
  });

  /** 表单验证规则 */
  const rules = reactive({<%# d.editRules.forEach(function(item,i){ %>
    <% item.prop %>: [
      {
        required: true,
        message: '请输入<% item.label %>',
        type: '<% item.type %>',
        trigger: '<% item.trigger %>'
      }
    ]<% i === (d.editRules.length - 1) ? '' : ',' %><%# }); %>
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? update<% d.modelTypeName %> : add<% d.modelTypeName %>;
      saveOrUpdate(form)
        .then((msg) => {
          loading.value = false;
          EleMessage.success(msg);
          handleCancel();
          emit('done');
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error(e.message);
        });
    });
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      assignFields(props.data);
      isUpdate.value = true;
    } else {
      resetFields();
      isUpdate.value = false;
    }
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };
</script>
`;

/**
 * 接口生成模板
 */
export const apiTemplate = `import request from '@/utils/request';
import { download, toFormData, checkDownloadRes } from '@/utils/common';

/**
 * 分页查询<% d.modelText %>
 */
export async function page<% d.modelTypeName %>s(params) {
  const res = await request.get('/<% d.moduleName %>/<% d.modelName %>/list', { params });
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 查询全部<% d.modelText %>
 */
export async function list<% d.modelTypeName %>s(params) {
  const res = await request.get('/<% d.moduleName %>/<% d.modelName %>/list', { params });
  if (res.data.code === 200) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 根据id查询<% d.modelText %>
 */
export async function get<% d.modelTypeName %>(id) {
  const res = await request.get('/<% d.moduleName %>/<% d.modelName %>/' + id);
  if (res.data.code === 200) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 添加<% d.modelText %>
 */
export async function add<% d.modelTypeName %>(data) {
  const res = await request.post('/<% d.moduleName %>/<% d.modelName %>', data);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 修改<% d.modelText %>
 */
export async function update<% d.modelTypeName %>(data) {
  const res = await request.put('/<% d.moduleName %>/<% d.modelName %>', data);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 删除<% d.modelText %>
 */
export async function remove<% d.modelTypeName %>(id) {
  const res = await request.delete('/<% d.moduleName %>/<% d.modelName %>/' + id);
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 批量删除<% d.modelText %>
 */
export async function remove<% d.modelTypeName %>s(ids) {
  const res = await request.delete('/<% d.moduleName %>/<% d.modelName %>/' + ids.join());
  if (res.data.code === 200) {
    return res.data.msg;
  }
  return Promise.reject(new Error(res.data.msg));
}

/**
 * 导出<% d.modelText %>
 */
export async function export<% d.modelTypeName %>s(params) {
  const res = await request({
    url: '/<% d.moduleName %>/<% d.modelName %>/export',
    method: 'POST',
    data: toFormData(params),
    responseType: 'blob'
  });
  await checkDownloadRes(res);
  download(res.data, \`<% d.modelName %>_\${Date.now()}.xlsx\`);
}
`;

/**
 * 树表页面生成模板
 */
export const indexTreeTemplate = `<template>
  <ele-page>
    <!-- 搜索表单 -->
    <<% d.modelName %>-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        sticky
        ref="tableRef"
        row-key="<% d.primaryKey %>"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        :export-config="{ fileName: '<% d.modelText %>' }"
        :default-expand-all="true"
        :pagination="false"
        cache-key="<% d.tableCacheKey %>"
      >
        <template #toolbar>
          <el-button
            v-permission="'<% d.moduleName %>:<% d.modelName %>:add'"
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            class="ele-btn-icon"
            :icon="ColumnHeightOutlined"
            @click="expandAll"
          >
            展开全部
          </el-button>
          <el-button
            class="ele-btn-icon"
            :icon="VerticalAlignMiddleOutlined"
            @click="foldAll"
          >
            折叠全部
          </el-button>
        </template>
        <template #action="{ row }">
          <el-link
            v-permission="'<% d.moduleName %>:<% d.modelName %>:add'"
            type="primary"
            :underline="false"
            @click="openEdit(null, row.<% d.treeCode %>)"
          >
            添加
          </el-link>
          <el-divider
            v-permission="'<% d.moduleName %>:<% d.modelName %>:add'"
            direction="vertical"
            style="margin: 0 8px"
          />
          <el-link
            v-permission="'<% d.moduleName %>:<% d.modelName %>:edit'"
            type="primary"
            :underline="false"
            @click="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider
            v-permission="'<% d.moduleName %>:<% d.modelName %>:remove'"
            direction="vertical"
            style="margin: 0 8px"
          />
          <el-link
            v-permission="'<% d.moduleName %>:<% d.modelName %>:remove'"
            type="danger"
            :underline="false"
            @click="remove(row)"
          >
            删除
          </el-link>
        </template><%# d.columns.forEach(function(item){if(item.dictType){ %>
        <template #<% item.prop %>="{ row }">
          <dict-data
            code="<% item.dictType %>"
            type="tag"
            :model-value="row.<% item.prop %>"
          />
        </template><%# }}); %>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <<% d.modelName %>-edit
      v-model="showEdit"
      :data="current"
      :parent-id="parentId"
      @done="reload"
    />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import {
    PlusOutlined,
    ColumnHeightOutlined,
    VerticalAlignMiddleOutlined
  } from '@/components/icons';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage, toTree } from 'ele-admin-plus/es';
  import <% d.modelTypeName %>Search from './components/<% d.modelName %>-search.vue';
  import <% d.modelTypeName %>Edit from './components/<% d.modelName %>-edit.vue';
  import { list<% d.modelTypeName %>s, remove<% d.modelTypeName %> } from '@/api/<% d.moduleName %>/<% d.modelName %>';

  defineOptions({ name: '<% d.moduleTypeName %><% d.modelTypeName %>' });

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center',
      fixed: 'left'
    }<%# d.columns.forEach(function(item,columnItemIndex){ %>,
    {
      prop: '<% item.prop %>',
      label: '<% item.label %>',
      align: '<% columnItemIndex==0?'left':'center' %>',
      minWidth: 110<%# if(item.dictType){ %>,
      slot: '<% item.prop %>'<%# } %>
    }<%# }); %>,
    {
      columnKey: 'action',
      label: '操作',
      width: 180,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 上级菜单id */
  const parentId = ref();

  /** 表格数据源 */
  const datasource = async ({ where }) => {
    const data = await list<% d.modelTypeName %>s({ ...where });
    return toTree({
      data,
      idField: '<% d.treeCode %>',
      parentIdField: '<% d.treeParentCode %>'
    });
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ where });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row, id) => {
    current.value = row ?? null;
    parentId.value = id;
    showEdit.value = true;
  };

  /** 删除单个 */
  const remove = (row) => {
    ElMessageBox.confirm(
      '是否确认删除<% d.delTipName %>为"' + row.<% d.delTipKey %> + '"的数据项?',
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        remove<% d.modelTypeName %>(row.<% d.primaryKey %>)
          .then(() => {
            loading.close();
            EleMessage.success('删除成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 展开全部 */
  const expandAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(true);
  };

  /** 折叠全部 */
  const foldAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(false);
  };
</script>
`;

/**
 * 树表编辑弹窗生成模板
 */
export const editTreeTemplate = `<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="460"
    v-model="visible"
    :title="isUpdate ? '修改<% d.modelText %>' : '添加<% d.modelText %>'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    ><%# d.editForm.forEach(function(item){ %>
      <el-form-item label="<% item.label %>" prop="<% item.prop %>">
        <%# if(item.prop==d.treeParentCode){ %><el-tree-select
          clearable
          check-strictly
          default-expand-all
          :data="treeSelectData"
          node-key="<% d.treeCode %>"
          :props="{ label: '<% d.treeName %>' }"
          placeholder="请选择<% item.label %>"
          class="ele-fluid"
          v-model="form.<% item.prop %>"
        /><%# }else if(item.dictType){ %><dict-data
          code="<% item.dictType %>"<%# if(['radio','checkbox'].includes(item.formType)){ %>
          type="<% item.formType %>"<%# } %>
          v-model="form.<% item.prop %>"
        /><%# }else if(item.formType==='textarea'){ %><el-input
          :rows="4"
          type="textarea"
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# }else if(item.formType==='datetime'){ %><el-date-picker
          v-model="form.<% item.prop %>"
          value-format="YYYY-MM-DD"
          placeholder="请选择<% item.label %>"
          class="ele-fluid"
        /><%# }else{ %><el-input
          clearable
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# } %>
      </el-form-item><%# }); %>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { EleMessage, toTree } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import { add<% d.modelTypeName %>, update<% d.modelTypeName %>, list<% d.modelTypeName %>s } from '@/api/<% d.moduleName %>/<% d.modelName %>';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object,
    /** 上级id */
    parentId: Number
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    <% d.primaryKey %>: void 0<%# d.editForm.forEach(function(item){ %>,
    <% item.prop %>: <% item.isString ? "''" : 'void 0' %><%# }); %>
  });

  /** 表单验证规则 */
  const rules = reactive({<%# d.editRules.forEach(function(item,i){ %>
    <% item.prop %>: [
      {
        required: true,
        message: '请输入<% item.label %>',
        type: '<% item.type %>',
        trigger: '<% item.trigger %>'
      }
    ]<% i === (d.editRules.length - 1) ? '' : ',' %><%# }); %>
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? update<% d.modelTypeName %> : add<% d.modelTypeName %>;
      saveOrUpdate({ ...form, <% d.treeParentCode %>: form.parentId || 0 })
        .then((msg) => {
          loading.value = false;
          EleMessage.success(msg);
          handleCancel();
          emit('done');
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error(e.message);
        });
    });
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      assignFields({
        ...props.data,
        <% d.treeParentCode %>: props.data.parentId || void 0
      });
      isUpdate.value = true;
    } else {
      resetFields();
      form.<% d.treeParentCode %> = props.parentId;
      isUpdate.value = false;
    }
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };

  /** 下拉树数据 */
  const treeSelectData = ref([]);

  /** 获取下拉树数据 */
  list<% d.modelTypeName %>s()
    .then((list) => {
      treeSelectData.value = toTree({
        data: list,
        idField: '<% d.treeCode %>',
        parentIdField: '<% d.treeParentCode %>'
      });
    })
    .catch((e) => {
      EleMessage.error(e.message);
    });
</script>
`;

/**
 * 主子表编辑弹窗生成模板
 */
export const editSubTemplate = `<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="680"
    v-model="visible"
    :title="isUpdate ? '修改<% d.modelText %>' : '添加<% d.modelText %>'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    ><%# d.editForm.forEach(function(item){ %>
      <el-form-item label="<% item.label %>" prop="<% item.prop %>">
        <%# if(item.dictType){ %><dict-data
          code="<% item.dictType %>"<%# if(['radio','checkbox'].includes(item.formType)){ %>
          type="<% item.formType %>"<%# } %>
          v-model="form.<% item.prop %>"
        /><%# }else if(item.formType==='textarea'){ %><el-input
          :rows="4"
          type="textarea"
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# }else if(item.formType==='datetime'){ %><el-date-picker
          v-model="form.<% item.prop %>"
          value-format="YYYY-MM-DD"
          placeholder="请选择<% item.label %>"
          class="ele-fluid"
        /><%# }else{ %><el-input
          clearable
          v-model="form.<% item.prop %>"
          placeholder="请输入<% item.label %>"
        /><%# } %>
      </el-form-item><%# }); %>
      <el-divider style="margin: 32px 0 16px 0"><% d.subTable.modelText %>信息</el-divider>
      <ele-pro-table
        :loading="subTableLoading"
        row-key="<% d.subTable.primaryKey %>"
        :columns="columns"
        :datasource="form.<% d.subTable.classModelName %>List"
        v-model:selections="selections"
        :pagination="false"
        :tools="false"
        cell-class-name="editable-table-cell"
        class="editable-table"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            @click="handleAdd"
          >
            添加
          </el-button>
          <el-button
            type="danger"
            class="ele-btn-icon"
            :icon="DeleteOutlined"
            @click="handleRemove"
          >
            删除
          </el-button>
        </template><%# d.subTable.editForm.forEach(function(item){ %>
        <template #<% item.prop %>="{ row, $index }">
          <el-form-item
            :prop="'<% d.subTable.classModelName %>List.' + $index + '.<% item.prop %>'"
            label-width="0px"
            style="margin-bottom: 0px"
          >
            <%# if(item.dictType){ %><dict-data
              code="<% item.dictType %>"<%# if(['radio','checkbox'].includes(item.formType)){ %>
              type="<% item.formType %>"<%# } %>
              v-model="row.<% item.prop %>"
            /><%# }else if(item.formType==='datetime'){ %><el-date-picker
              v-model="row.<% item.prop %>"
              value-format="YYYY-MM-DD"
              placeholder="请选择<% item.label %>"
              class="ele-fluid"
            /><%# }else{ %><el-input
              clearable
              v-model="row.<% item.prop %>"
              placeholder="请输入<% item.label %>"
            /><%# } %>
          </el-form-item>
        </template><%# }); %>
      </ele-pro-table>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { PlusOutlined, DeleteOutlined } from '@/components/icons';
  import { useFormData } from '@/utils/use-form-data';
  import { add<% d.modelTypeName %>, update<% d.modelTypeName %>, get<% d.modelTypeName %> } from '@/api/<% d.moduleName %>/<% d.modelName %>';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    <% d.subTable.classModelName %>List: [],
    <% d.primaryKey %>: void 0<%# d.editForm.forEach(function(item){ %>,
    <% item.prop %>: <% item.isString ? "''" : 'void 0' %><%# }); %>
  });

  /** 表单验证规则 */
  const rules = reactive({<%# d.editRules.forEach(function(item,i){ %>
    <% item.prop %>: [
      {
        required: true,
        message: '请输入<% item.label %>',
        type: '<% item.type %>',
        trigger: '<% item.trigger %>'
      }
    ]<% i === (d.editRules.length - 1) ? '' : ',' %><%# }); %>
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? update<% d.modelTypeName %> : add<% d.modelTypeName %>;
      saveOrUpdate(form)
        .then((msg) => {
          loading.value = false;
          EleMessage.success(msg);
          handleCancel();
          emit('done');
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error(e.message);
        });
    });
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      assignFields({
        ...props.data,
        <% d.subTable.classModelName %>List: []
      });
      isUpdate.value = true;
      subTableLoading.value = true;
      get<% d.modelTypeName %>(props.data.<% d.primaryKey %>)
        .then((info) => {
          subTableLoading.value = false;
          assignFields({
            ...info,
            <% d.subTable.classModelName %>List: info.<% d.subTable.classModelName %>List || []
          });
        })
        .catch((e) => {
          subTableLoading.value = false;
          EleMessage.error(e.message);
        });
    } else {
      resetFields();
      isUpdate.value = false;
    }
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };

  /** 表格加载状态 */
  const subTableLoading = ref(false);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center',
      fixed: 'left'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center',
      fixed: 'left'
    }<%# d.subTable.editForm.forEach(function(item){ %>,
    {
      prop: '<% item.prop %>',
      label: '<% item.label %>',
      align: 'center',
      minWidth: 110,
      slot: '<% item.prop %>'
    }<%# }); %>
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  let tempIndex = 0;

  /** 添加 */
  const handleAdd = () => {
    tempIndex++;
    const item = {};
    item.<% d.subTable.primaryKey %> = '_temp_' + tempIndex;
    form.<% d.subTable.classModelName %>List.push(item);
  };

  /** 删除 */
  const handleRemove = () => {
    if (!selections.value.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    form.<% d.subTable.classModelName %>List = form.<% d.subTable.classModelName %>List.filter((d) => {
      return !selections.value.includes(d);
    });
  };
</script>

<style lang="scss" scoped>
  .editable-table :deep(.editable-table-cell) {
    position: static;

    & > .cell {
      overflow: visible;
    }
  }
</style>
`;

/**
 * 获取模板数据
 * @param res 接口数据
 */
export function getTemplateData(res) {
  const primaryField = {};
  const columns = [];
  const queryForm = [];
  const editForm = [];
  const editRules = [];
  const treeOption = {};
  res.info.columns.forEach((col) => {
    if (col.isPk == '1') {
      primaryField.prop = col.javaField;
      primaryField.label = col.columnComment;
    }
    if (col.isList == '1') {
      columns.push({
        prop: col.javaField,
        label: col.columnComment,
        dictType: col.dictType
      });
    }
    if (col.isQuery == '1') {
      queryForm.push({
        prop: col.javaField,
        label: col.columnComment,
        dictType: col.dictType,
        isString: ['String', 'Date'].includes(col.javaType)
      });
    }
    if (col.isEdit == '1') {
      editForm.push({
        prop: col.javaField,
        label: col.columnComment,
        dictType: col.dictType,
        formType: col.htmlType,
        isString: ['String', 'Date'].includes(col.javaType)
      });
      if (col.isRequired == '1') {
        editRules.push({
          prop: col.javaField,
          label: col.columnComment,
          type: ['String', 'Date'].includes(col.javaType) ? 'string' : 'number',
          trigger: [
            'select',
            'radio',
            'checkbox',
            'imageUpload',
            'fileUpload',
            'editor'
          ].includes(col.htmlType)
            ? 'change'
            : 'blur'
        });
      }
    }
    if (res.info.treeCode && col.columnName === res.info.treeCode) {
      treeOption.treeCode = col.javaField;
    }
    if (res.info.treeParentCode && col.columnName === res.info.treeParentCode) {
      treeOption.treeParentCode = col.javaField;
    }
    if (res.info.treeName && col.columnName === res.info.treeName) {
      treeOption.treeName = col.javaField;
    }
  });
  const moduleName = res.info.moduleName;
  const modelTypeName = capitalizeStr(res.info.businessName);
  const primaryKey = primaryField.prop || 'key';
  const firstColumn = columns.length ? columns[0] : primaryField;
  const subTableInfo =
    res.info.sub && res.info.subTableName && res.tables
      ? res.tables.find((t) => t.tableName === res.info.subTableName)
      : void 0;
  return {
    modelName: res.info.businessName, // 模型名
    modelTypeName, // 模型类型名
    modelText: res.info.functionName, // 模型显示文本
    primaryKey, // 主键名
    moduleName, // 模块名
    moduleTypeName: capitalizeStr(moduleName), // 模块类型名
    tableCacheKey: moduleName + modelTypeName + 'Table', // 表格缓存名
    columns, // 表格列
    delTipKey: firstColumn.prop || primaryKey, // 删除提示字段名
    delTipName: firstColumn.label || '', // 删除提示文本名
    queryForm, // 搜索表单
    editForm, // 编辑表单
    editRules, // 编辑表单验证规则
    classModelName: lowerFirstStr(res.info.className),
    subTable: subTableInfo ? getTemplateData({ info: subTableInfo }) : void 0,
    ...treeOption
  };
}

/**
 * 字符串首字母大写
 * @param str 字符串
 */
export function capitalizeStr(str) {
  if (str == null || str === '') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 字符串首字母小写
 * @param str 字符串
 */
export function lowerFirstStr(str) {
  if (str == null || str === '') {
    return '';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 下载文本
 * @param text 文本内容
 * @param name 文件名称
 */
export function downloadText(text, name) {
  download(text, name, 'text/plain;charset=utf-8');
}
