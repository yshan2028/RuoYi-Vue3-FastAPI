<template>
  <ele-drawer
    :size="1200"
    style="max-width: 100%"
    title="调度日志"
    :append-to-body="true"
    :destroy-on-close="true"
    v-model="visible"
    @open="handleOpen"
  >
    <job-log-search :data="data" style="margin-bottom: -8px" @search="reload" />
    <ele-pro-table
      ref="tableRef"
      row-key="jobLogId"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
      :export-config="{ fileName: '调度日志' }"
      cache-key="monitorJobLogTable"
    >
      <template #toolbar>
        <el-button
          type="danger"
          class="ele-btn-icon"
          :icon="DeleteOutlined"
          v-permission="'monitor:job:remove'"
          @click="removeBatch()"
        >
          删除
        </el-button>
        <el-button
          plain
          type="danger"
          class="ele-btn-icon"
          :icon="CloseCircleOutlined"
          v-permission="'monitor:job:remove'"
          @click="removeAll"
        >
          清空
        </el-button>
        <el-button
          class="ele-btn-icon"
          :icon="DownloadOutlined"
          v-permission="'monitor:job:export'"
          @click="exportData"
        >
          导出
        </el-button>
      </template>
      <template #jobGroup="{ row }">
        <dict-data
          code="sys_job_group"
          type="tag"
          :model-value="row.jobGroup"
        />
      </template>
      <template #status="{ row }">
        <dict-data
          code="sys_common_status"
          type="tag"
          :model-value="row.status"
        />
      </template>
      <template #action="{ row }">
        <el-link type="primary" :underline="false" @click="openDetail(row)">
          详情
        </el-link>
      </template>
    </ele-pro-table>
  </ele-drawer>
  <!-- 详情弹窗 -->
  <job-log-detail v-model="showInfo" :data="current" />
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    DeleteOutlined,
    CloseCircleOutlined,
    DownloadOutlined
  } from '@/components/icons';
  import { usePermission } from '@/utils/use-permission';
  import { useDictData } from '@/utils/use-dict-data';
  import JobLogSearch from './job-log-search.vue';
  import JobLogDetail from './job-log-detail.vue';
  import {
    pageJobLogs,
    removeJobLogs,
    exportJobLogs,
    clearJoblogs
  } from '@/api/monitor/job-log';

  const props = defineProps({
    /** 定时任务 */
    data: Object
  });

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  const { hasPermission } = usePermission();

  /** 字典数据 */
  const [statusDicts] = useDictData(['sys_common_status']);

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = computed(() => {
    const cols = [
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
        prop: 'jobName',
        label: '任务名称',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'jobGroup',
        label: '任务组名',
        align: 'center',
        minWidth: 110,
        slot: 'jobGroup'
      },
      {
        prop: 'invokeTarget',
        label: '调用目标字符串',
        align: 'center',
        minWidth: 140
      },
      {
        prop: 'jobMessage',
        label: '日志信息',
        align: 'center',
        minWidth: 110
      },
      {
        prop: 'status',
        label: '执行状态',
        width: 110,
        align: 'center',
        slot: 'status',
        filters: statusDicts.value.map((d) => {
          return { text: d.dictLabel, value: d.dictValue };
        }),
        filterMultiple: false
      },
      {
        prop: 'createTime',
        label: '执行时间',
        align: 'center',
        minWidth: 110
      }
    ];
    if (hasPermission('monitor:job:query')) {
      cols.push({
        columnKey: 'action',
        label: '操作',
        width: 80,
        align: 'center',
        slot: 'action',
        fixed: 'right',
        hideInPrint: true,
        hideInExport: true
      });
    }
    return cols;
  });

  /** 表格选中数据 */
  const selections = ref([]);

  /** 当前选中数据 */
  const current = ref({});

  /** 是否显示查看弹窗 */
  const showInfo = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where, filters }) => {
    const params = { ...where, ...filters, ...pages };
    if (props.data) {
      params.jobName = props.data?.jobName;
      params.jobGroup = props.data?.jobGroup;
    }
    return pageJobLogs(params);
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ where });
  };

  /** 批量删除 */
  const removeBatch = () => {
    if (!selections.value.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    const ids = selections.value.map((d) => d.jobLogId);
    ElMessageBox.confirm(
      `是否确认删除调度日志编号为"${ids.join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeJobLogs(ids)
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
    tableRef.value?.fetch?.(({ where, filters }) => {
      const params = { ...where, ...filters };
      if (props.data) {
        params.jobName = props.data?.jobName;
        params.jobGroup = props.data?.jobGroup;
      }
      exportJobLogs(params)
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    });
  };

  /** 清空 */
  const removeAll = () => {
    ElMessageBox.confirm('是否确认清空所有调度日志数据项？', '系统提示', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        clearJoblogs()
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

  /** 详情 */
  const openDetail = (row) => {
    current.value = row;
    showInfo.value = true;
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    selections.value = [];
    reload();
  };
</script>
