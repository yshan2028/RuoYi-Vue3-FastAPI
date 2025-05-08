<template>
  <div>
    <ele-pro-table
      ref="tableRef"
      row-key="id"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      :highlight-current-row="true"
      :export-config="{ fileName: '待办事项数据' }"
    >
      <template #toolbar>
        <el-button type="primary" class="ele-btn-icon" @click="ok()">
          批量完成
        </el-button>
        <el-button type="danger" class="ele-btn-icon" @click="remove()">
          删除待办
        </el-button>
      </template>
      <template #status="{ row }">
        <ele-text v-if="row.status === 0" type="warning">未完成</ele-text>
        <ele-text v-else-if="row.status === 1" type="info">已完成</ele-text>
      </template>
      <template #action="{ row }">
        <el-link type="primary" :underline="false" @click="ok(row)">
          完成
        </el-link>
        <el-divider direction="vertical" />
        <el-link type="danger" :underline="false" @click="remove(row)">
          删除
        </el-link>
      </template>
    </ele-pro-table>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useMessage } from 'ele-admin-plus/es';
  import { pageTodos } from '@/api/example';

  const emit = defineEmits(['reload']);

  const EleMessage = useMessage({ inner: true });

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
      prop: 'title',
      label: '待办内容',
      minWidth: 220
    },
    {
      prop: 'time',
      label: '结束时间',
      width: 180,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status',
      formatter: (row) => (row.status == 0 ? '未完成' : '已完成')
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 120,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 列表选中数据 */
  const selections = ref([]);

  /** 表格数据源 */
  const datasource = ({ pages, where, orders }) => {
    return pageTodos({ ...where, ...orders, ...pages });
  };

  /** 完成 */
  const ok = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    EleMessage.success('点击了完成');
    updateUnReadNum();
  };

  /** 删除单个 */
  const remove = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    EleMessage.error('点击了删除');
  };

  /** 触发更新未读数量事件 */
  const updateUnReadNum = () => {
    emit('reload');
  };
</script>
