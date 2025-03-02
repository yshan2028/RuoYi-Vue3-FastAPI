<template>
  <ele-page>
    <!-- 搜索表单 -->
    <config-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="configId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        highlight-current-row
        cache-key="systemConfigTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="Plus"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            type="danger"
            class="ele-btn-icon hidden-sm-and-down"
            :icon="Delete"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button class="ele-btn-icon" :icon="Download" @click="exportData">
            导出
          </el-button>
          <el-button class="ele-btn-icon" :icon="Refresh" @click="refreshCache">
            刷新缓存
          </el-button>
        </template>
        <template #configType="{ row }">
          <dict-data
            code="sys_yes_no"
            type="tag"
            :model-value="row.configType"
          />
        </template>
        <template #action="{ row }">
          <el-link type="primary" :underline="false" @click="openEdit(row)">
            修改
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="danger" :underline="false" @click="removeBatch(row)">
            删除
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <config-edit v-model="showEdit" :data="current" @done="reload" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { Plus, Delete, Download, Refresh } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import ConfigSearch from './components/config-search.vue';
  import ConfigEdit from './components/config-edit.vue';
  import {
    pageConfigs,
    removeConfigs,
    exportConfigs,
    refreshConfigs
  } from '@/api/system/config';

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
      prop: 'configName',
      label: '参数名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'configKey',
      label: '参数键名',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'configValue',
      label: '参数键值',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'configType',
      label: '系统内置',
      width: 90,
      align: 'center',
      slot: 'configType'
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
      minWidth: 110
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 120,
      align: 'center',
      slot: 'action'
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 表格数据源 */
  const datasource = ({ page, limit, where, orders }) => {
    return pageConfigs({ ...where, ...orders, pageNum: page, pageSize: limit });
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
      `是否确认删除参数键名为"${rows.map((d) => d.configKey).join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeConfigs(rows.map((d) => d.configId))
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
    const loading = EleMessage.loading('请求中..');
    tableRef.value?.fetch?.(({ where, orders }) => {
      exportConfigs({ ...where, ...orders })
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
    const loading = EleMessage.loading('请求中..');
    refreshConfigs()
      .then(() => {
        loading.close();
        EleMessage.success('刷新成功');
      })
      .catch((e) => {
        loading.close();
        EleMessage.error(e.message);
      });
  };
</script>

<script>
  export default {
    name: 'SystemConfig'
  };
</script>
