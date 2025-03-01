<template>
  <ele-page>
    <!-- 搜索表单 -->
    <operlog-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="oper_id"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        highlight-current-row
        cache-key="systemLogOperlogTable"
      >
        <template #toolbar>
          <el-button
            type="danger"
            class="ele-btn-icon"
            :icon="Delete"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button
            plain
            type="danger"
            class="ele-btn-icon"
            :icon="Delete"
            @click="removeAll"
          >
            清空
          </el-button>
          <el-button class="ele-btn-icon" :icon="Download" @click="exportData">
            导出
          </el-button>
        </template>
        <template #status="{ row }">
          <dict-data
            code="sys_common_status"
            type="tag"
            :model-value="row.status"
          />
        </template>
        <template #business_type="{ row }">
          <dict-data
            code="sys_oper_type"
            type="tag"
            :model-value="row.business_type"
          />
        </template>
        <template #action="{ row }">
          <el-link type="primary" :underline="false" @click="openDetail(row)">
            详情
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
    <!-- 详情弹窗 -->
    <operlog-detail v-model="showInfo" :data="current" />
  </ele-page>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Delete, Download } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useDictData } from '@/utils/use-dict-data';
  import OperlogSearch from './components/operlog-search.vue';
  import OperlogDetail from './components/operlog-detail.vue';
  import {
    pageOperlogs,
    exportOperlogs,
    removeOperlogs,
    clearOperlogs
  } from '@/api/monitor/operlog';

  /** 字典数据 */
  const [statusDicts, operTypeDicts] = useDictData([
    'sys_common_status',
    'sys_oper_type'
  ]);

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = computed(() => {
    return [
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
        label: '系统模块',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'business_type',
        label: '操作类型',
        width: 110,
        slot: 'business_type',
        align: 'center',
        filters: operTypeDicts.value.map((d) => {
          return { text: d.dict_label, value: d.dict_value };
        }),
        filterMultiple: false
      },
      {
        prop: 'oper_name',
        label: '操作人员',
        sortable: 'custom',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'oper_ip',
        label: '操作地址',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'oper_location',
        label: '操作地点',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'status',
        label: '操作状态',
        width: 110,
        slot: 'status',
        align: 'center',
        filters: statusDicts.value.map((d) => {
          return { text: d.dict_label, value: d.dict_value };
        }),
        filterMultiple: false
      },
      {
        prop: 'oper_time',
        label: '操作日期',
        sortable: 'custom',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'cost_time',
        label: '消耗时间',
        sortable: 'custom',
        align: 'center',
        formatter: (row) => `${row.cost_time}毫秒`,
        width: 110
      },
      {
        columnKey: 'action',
        label: '操作',
        width: 80,
        align: 'center',
        slot: 'action',
        fixed: 'right'
      }
    ];
  });

  /** 当前选中数据 */
  const current = ref({});

  /** 是否显示查看弹窗 */
  const showInfo = ref(false);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格数据源 */
  const datasource = ({ page, limit, where, orders, filters }) => {
    return pageOperlogs({
      ...where,
      ...orders,
      ...filters,
      pageNum: page,
      pageSize: limit
    });
  };

  /** 刷新表格 */
  const reload = (where) => {
    tableRef.value?.reload?.({ page: 1, where });
  };

  /** 详情 */
  const openDetail = (row) => {
    current.value = row;
    showInfo.value = true;
  };

  /** 导出数据 */
  const exportData = () => {
    const loading = EleMessage.loading('请求中..');
    tableRef.value?.fetch?.(({ where, orders, filters }) => {
      exportOperlogs({ ...where, ...orders, ...filters })
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    });
  };

  /** 批量删除 */
  const removeBatch = () => {
    if (!selections.value.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    const ids = selections.value.map((d) => d.oper_id);
    ElMessageBox.confirm(
      `是否确认删除日志编号为"${ids.join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true, customStyle: { maxWidth: '442px' } }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeOperlogs(ids)
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

  /** 清空 */
  const removeAll = () => {
    ElMessageBox.confirm('是否确认清空所有操作日志数据项？', '系统提示', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        clearOperlogs()
          .then(() => {
            loading.close();
            EleMessage.success('清空成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };
</script>

<script>
  export default {
    name: 'SystemLogOperlog'
  };
</script>
