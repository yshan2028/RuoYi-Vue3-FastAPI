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
      :export-config="{ fileName: '用户私信数据' }"
    >
      <template #toolbar>
        <el-button type="primary" class="ele-btn-icon" @click="readBatch">
          标记已读
        </el-button>
        <el-button type="danger" class="ele-btn-icon" @click="remove()">
          删除消息
        </el-button>
      </template>
      <template #status="{ row }">
        <ele-text v-if="row.status === 0" type="warning">未读</ele-text>
        <ele-text v-else-if="row.status === 1" type="info">已读</ele-text>
      </template>
      <template #action="{ row }">
        <el-link type="primary" :underline="false" @click="reply(row)">
          回复
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
  import { pageLetters } from '@/api/example';

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
      label: '私信内容',
      minWidth: 220
    },
    {
      prop: 'time',
      label: '发送时间',
      width: 180,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      slot: 'status',
      formatter: (row) => (row.status == 0 ? '未读' : '已读')
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
    return pageLetters({ ...where, ...orders, ...pages });
  };

  /** 回复 */
  const reply = (row) => {
    console.log(JSON.parse(JSON.stringify(row)));
    EleMessage.success('点击了回复');
  };

  /** 删除 */
  const remove = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    EleMessage.error('点击了删除');
  };

  /** 标记已读 */
  const readBatch = () => {
    if (!selections.value.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    EleMessage.success('点击了标记已读');
    updateUnReadNum();
  };

  /** 触发更新未读数量事件 */
  const updateUnReadNum = () => {
    emit('reload');
  };
</script>
