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
        :export-config="{ fileName: '参数设置' }"
        cache-key="systemConfigTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            v-permission="'system:config:add'"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            type="danger"
            class="ele-btn-icon hidden-sm-and-down"
            :icon="DeleteOutlined"
            v-permission="'system:config:remove'"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button
            class="ele-btn-icon"
            :icon="DownloadOutlined"
            v-permission="'system:config:export'"
            @click="exportData"
          >
            导出
          </el-button>
          <el-button
            class="ele-btn-icon"
            :icon="SyncOutlined"
            v-permission="'system:config:remove'"
            @click="refreshCache"
          >
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
          <el-link
            v-permission="'system:config:edit'"
            type="primary"
            :underline="false"
            @click="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider
            v-permission="['system:config:edit', 'system:config:remove']"
            direction="vertical"
          />
          <el-link
            v-permission="'system:config:remove'"
            type="danger"
            :underline="false"
            @click="removeBatch(row)"
          >
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
  import { ref, computed } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
    SyncOutlined
  } from '@/components/icons';
  import { useDictData } from '@/utils/use-dict-data';
  import ConfigSearch from './components/config-search.vue';
  import ConfigEdit from './components/config-edit.vue';
  import {
    pageConfigs,
    removeConfigs,
    exportConfigs,
    refreshConfigs
  } from '@/api/system/config';

  defineOptions({ name: 'SystemConfig' });

  /** 字典数据 */
  const [configTypeDicts] = useDictData(['sys_yes_no']);

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
        width: 110,
        align: 'center',
        slot: 'configType',
        filters: configTypeDicts.value.map((d) => {
          return { text: d.dictLabel, value: d.dictValue };
        }),
        filterMultiple: false,
        formatter: (row) =>
          configTypeDicts.value.find((d) => d.dictValue == row.configType)
            ?.dictLabel
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
        width: 120,
        align: 'center',
        slot: 'action',
        hideInPrint: true,
        hideInExport: true
      }
    ];
  });

  /** 表格选中数据 */
  const selections = ref([]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where, filters }) => {
    return pageConfigs({ ...where, ...filters, ...pages });
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
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
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
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
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
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
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
