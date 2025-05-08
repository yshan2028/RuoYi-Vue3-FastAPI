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
        :export-config="{ fileName: '代码生成' }"
        cache-key="toolGenTable"
      >
        <template #toolbar>
          <el-space :size="12" wrap>
            <el-button
              type="primary"
              class="ele-btn-icon"
              :icon="DownloadOutlined"
              v-permission="'tool:gen:code'"
              @click="generate()"
            >
              生成
            </el-button>
            <el-button
              type="primary"
              class="ele-btn-icon"
              :icon="PlusOutlined"
              v-role="'admin'"
              @click="openCreate"
            >
              创建
            </el-button>
            <el-button
              type="danger"
              class="ele-btn-icon"
              :icon="DeleteOutlined"
              v-permission="'tool:gen:remove'"
              @click="removeBatch()"
            >
              删除
            </el-button>
            <el-button
              class="ele-btn-icon"
              :icon="UploadOutlined"
              v-permission="'tool:gen:import'"
              @click="openImport"
            >
              导入
            </el-button>
          </el-space>
        </template>
        <template #action="{ row }">
          <el-link
            v-permission="'tool:gen:preview'"
            type="primary"
            :underline="false"
            @click="openPreview(row)"
          >
            预览
          </el-link>
          <el-divider v-permission="'ool:gen:code'" direction="vertical" />
          <el-link
            v-permission="'ool:gen:code'"
            type="primary"
            :underline="false"
            @click="generate(row)"
          >
            生成
          </el-link>
          <el-divider v-permission="'tool:gen:edit'" direction="vertical" />
          <el-link
            v-permission="'tool:gen:edit'"
            type="primary"
            :underline="false"
            @click="sync(row)"
          >
            同步
          </el-link>
          <el-divider v-permission="'tool:gen:edit'" direction="vertical" />
          <el-link
            v-permission="'tool:gen:edit'"
            type="primary"
            :underline="false"
            @click="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider v-permission="'tool:gen:remove'" direction="vertical" />
          <el-link
            v-permission="'tool:gen:remove'"
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
    <gen-edit v-model="showEdit" :data="current" @done="reload" />
    <!-- 导入弹窗 -->
    <gen-import v-model="showImport" @done="reload" />
    <!-- 预览弹窗 -->
    <gen-preview :id="current?.tableId" v-model="showPreview" />
    <!-- 创建表弹窗 -->
    <gen-create v-model="showCreate" @done="reload" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    DownloadOutlined,
    DeleteOutlined,
    UploadOutlined,
    PlusOutlined
  } from '@/components/icons';
  import GenSearch from './components/gen-search.vue';
  import GenEdit from './components/gen-edit.vue';
  import GenImport from './components/gen-import.vue';
  import GenPreview from './components/gen-preview.vue';
  import GenCreate from './components/gen-create.vue';
  import {
    pageGens,
    removeGens,
    synchDb,
    genCode,
    genCodeZipPro
  } from '@/api/tool/gen';

  defineOptions({ name: 'ToolGen' });

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
      width: 180
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      align: 'center',
      width: 180
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 280,
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

  /** 是否显示导入弹窗 */
  const showImport = ref(false);

  /** 是否显示预览弹窗 */
  const showPreview = ref(false);

  /** 是否显示创建表弹窗 */
  const showCreate = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where }) => {
    return pageGens({ ...where, ...pages });
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
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
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
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
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
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
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
      genCodeZipPro(
        { tables: row ? row.tableName : names },
        row ? [row.tableId] : selections.value.map((d) => d.tableId)
      )
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    }
  };

  /** 打开创建表弹窗 */
  const openCreate = () => {
    showCreate.value = true;
  };
</script>
