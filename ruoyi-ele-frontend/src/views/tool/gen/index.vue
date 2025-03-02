<template>
  <ele-page>
    <!-- 搜索表单 -->
    <gen-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="tableId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        highlight-current-row
        cache-key="toolGenTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="Download"
            @click="generate()"
          >
            生成
          </el-button>
          <el-button
            type="danger"
            class="ele-btn-icon"
            :icon="Delete"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button class="ele-btn-icon" :icon="Upload" @click="openImport">
            导入
          </el-button>
        </template>
        <template #action="{ row }">
          <el-link type="primary" :underline="false" @click="openPreview(row)">
            预览
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" :underline="false" @click="generate(row)">
            生成
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" :underline="false" @click="sync(row)">
            同步
          </el-link>
          <el-divider direction="vertical" />
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
    <gen-edit v-model="showEdit" :data="current" @done="reload" />
    <!-- 导入弹窗 -->
    <gen-import v-model="showImport" @done="reload" />
    <!-- 预览弹窗 -->
    <gen-preview :id="current?.tableId" v-model="showPreview" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { Delete, Download, Upload } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import GenSearch from './components/gen-search.vue';
  import GenEdit from './components/gen-edit.vue';
  import GenImport from './components/gen-import.vue';
  import GenPreview from './components/gen-preview.vue';
  import {
    pageGens,
    removeGens,
    synchDb,
    genCode,
    genCodeZip
  } from '@/api/tool/gen';

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
      prop: 'className',
      label: '实体',
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
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 280,
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

  /** 是否显示导入弹窗 */
  const showImport = ref(false);

  /** 是否显示预览弹窗 */
  const showPreview = ref(false);

  /** 表格数据源 */
  const datasource = ({ page, limit, where }) => {
    return pageGens({ ...where, pageNum: page, pageSize: limit });
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

  /** 打开导入弹窗 */
  const openImport = () => {
    showImport.value = true;
  };

  /** 打开预览弹窗 */
  const openPreview = (row) => {
    current.value = row ?? null;
    showPreview.value = true;
  };

  /** 批量删除 */
  const removeBatch = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    ElMessageBox.confirm(
      `是否确认删除表名称为"${rows.map((d) => d.tableName).join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeGens(rows.map((d) => d.tableId))
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

  /** 同步 */
  const sync = (row) => {
    ElMessageBox.confirm(
      '确认要强制同步“' + row.tableName + '”的表结构吗？',
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        synchDb(row.tableName)
          .then(() => {
            loading.close();
            EleMessage.success('同步成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 生成 */
  const generate = (row) => {
    if (!row && !selections.value.length) {
      EleMessage.error('请选择要生成的数据');
      return;
    }
    const loading = EleMessage.loading('请求中..');
    if (row && row.genType == '1') {
      genCode(row.tableName)
        .then(() => {
          loading.close();
          EleMessage.success('成功生成到自定义路径:' + row.genPath);
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    } else {
      const names = selections.value.map((d) => d.tableName).join();
      genCodeZip({ tables: row ? row.tableName : names })
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    }
  };
</script>

<script>
  export default {
    name: 'ToolGen'
  };
</script>
