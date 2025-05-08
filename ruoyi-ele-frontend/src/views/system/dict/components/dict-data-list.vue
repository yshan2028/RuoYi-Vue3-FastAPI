<template>
  <dict-data-search
    ref="searchRef"
    style="margin-bottom: -14px"
    @search="reload"
  />
  <!-- 表格 -->
  <ele-pro-table
    ref="tableRef"
    row-key="dictCode"
    :columns="columns"
    :datasource="datasource"
    :show-overflow-tooltip="true"
    v-model:selections="selections"
    highlight-current-row
    :export-config="{ fileName: '字典数据' }"
    :style="{ paddingBottom: '16px' }"
    cache-key="systemDictDataTable"
  >
    <template #toolbar>
      <el-space :size="12" wrap>
        <el-button
          type="primary"
          class="ele-btn-icon"
          :icon="PlusOutlined"
          v-permission="'system:dict:add'"
          @click="openEdit()"
        >
          新建
        </el-button>
        <el-button
          type="danger"
          class="ele-btn-icon"
          :icon="DeleteOutlined"
          v-permission="'system:dict:remove'"
          @click="removeBatch()"
        >
          删除
        </el-button>
        <el-button
          class="ele-btn-icon"
          :icon="DownloadOutlined"
          v-permission="'system:dict:export'"
          @click="exportData"
        >
          导出
        </el-button>
        <el-button
          class="ele-btn-icon"
          :icon="SyncOutlined"
          v-permission="'system:dict:remove'"
          @click="refreshCache"
        >
          刷新缓存
        </el-button>
      </el-space>
    </template>
    <template #status="{ row }">
      <dict-data
        code="sys_normal_disable"
        type="tag"
        :model-value="row.status"
      />
    </template>
    <template #action="{ row }">
      <el-link
        v-permission="'system:dict:edit'"
        type="primary"
        :underline="false"
        @click="openEdit(row)"
      >
        修改
      </el-link>
      <el-divider
        v-permission="['system:dict:edit', 'system:dict:remove']"
        direction="vertical"
      />
      <el-link
        v-permission="'system:dict:remove'"
        type="danger"
        :underline="false"
        @click="removeBatch(row)"
      >
        删除
      </el-link>
    </template>
  </ele-pro-table>
  <!-- 编辑弹窗 -->
  <dict-data-edit
    v-model="showEdit"
    :data="current"
    :dict-type="dictType"
    @done="reload"
  />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
    SyncOutlined
  } from '@/components/icons';
  import { useDictData } from '@/utils/use-dict-data';
  import DictDataSearch from './dict-data-search.vue';
  import DictDataEdit from './dict-data-edit.vue';
  import {
    pageDictDatas,
    removeDictDataBatch,
    exportDictDatas
  } from '@/api/system/dict-data';
  import { refreshDicts } from '@/api/system/dict';
  import { useUserStore } from '@/store/modules/user';

  /** 字典数据 */
  const [statusDicts] = useDictData(['sys_normal_disable']);

  const props = defineProps({
    /** 字典类型 */
    dictType: String
  });

  const userStore = useUserStore();

  /** 搜索栏实例 */
  const searchRef = ref(null);

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
      prop: 'dictLabel',
      label: '数据标签',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'dictValue',
      label: '数据键值',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'dictSort',
      label: '显示排序',
      width: 110,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status',
      formatter: (row) =>
        statusDicts.value.find((d) => d.dictValue == row.status)?.dictLabel
    },
    {
      prop: 'remark',
      label: '备注',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'createTime',
      label: '创建时间',
      align: 'center',
      width: 180
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 130,
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
  const datasource = ({ pages, where, orders }) => {
    return pageDictDatas({
      ...where,
      ...orders,
      ...pages,
      dictType: props.dictType
    });
  };

  /** 刷新表格 */
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
      `是否确认删除数据标签为"${rows.map((d) => d.dictLabel).join()}"的数据项?`,
      '系统提示',
      {
        type: 'warning',
        draggable: true
      }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeDictDataBatch(rows.map((d) => d.dictCode))
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
    tableRef.value?.fetch?.(({ where, orders }) => {
      exportDictDatas({ ...where, ...orders })
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    });
  };

  /** 刷新缓存 */
  const refreshCache = () => {
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
    refreshDicts()
      .then(() => {
        userStore.setDicts(null, {});
        loading.close();
        EleMessage.success('刷新成功');
      })
      .catch((e) => {
        loading.close();
        EleMessage.error(e.message);
      });
  };

  // 监听字典id变化
  watch(
    () => props.dictType,
    () => {
      searchRef.value?.resetFields?.();
      reload({});
    }
  );
</script>
