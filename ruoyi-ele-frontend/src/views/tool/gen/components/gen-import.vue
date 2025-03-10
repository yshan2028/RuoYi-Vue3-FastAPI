<template>
  <ele-modal
    :width="880"
    title="导入表"
    :body-style="{ padding: '4px 16px' }"
    :destroy-on-close="true"
    v-model="visible"
    @open="handleOpen"
  >
    <gen-import-search @search="reload" />
    <ele-pro-table
      ref="tableRef"
      row-key="tableName"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
      :toolbar="false"
      :pagination="{ pageSize: 6, pageSizes: [6, 10, 20, 40, 100] }"
    />
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import GenImportSearch from './gen-import-search.vue';
  import { pageGenDbs, importTables } from '@/api/tool/gen';

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 提交状态 */
  const loading = ref(false);

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
    },
    {
      prop: 'tableName',
      label: '表名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'tableComment',
      label: '表描述',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'createTime',
      label: '创建时间',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      align: 'center',
      minWidth: 110
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格数据源 */
  const datasource = ({ pages, where }) => {
    return pageGenDbs({ ...where, ...pages });
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ page: 1, where });
  };

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 导入 */
  const save = () => {
    if (!selections.value.length) {
      EleMessage.error('请选择要导入的表');
      return;
    }
    loading.value = true;
    const tables = selections.value.map((d) => d.tableName).join();
    importTables({ tables })
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
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    selections.value = [];
    reload();
  };
</script>
