<template>
  <ele-page>
    <!-- 搜索表单 -->
    <post-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="postId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        :highlight-current-row="true"
        :export-config="{ fileName: '岗位信息', datasource: exportSource }"
        :print-config="{ datasource: exportSource }"
        :tools="['reload', 'export', 'print', 'size', 'columns', 'maximized']"
        cache-key="systemPostTable"
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
            class="ele-btn-icon"
            :icon="Delete"
            @click="removeBatch()"
          >
            删除
          </el-button>
          <el-button class="ele-btn-icon" :icon="Download" @click="exportData">
            导出
          </el-button>
        </template>
        <template #status="{ row }">
          <dict-data
            code="sys_normal_disable"
            type="tag"
            :model-value="row.status"
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
    <post-edit v-model="showEdit" :data="current" @done="reload" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { Plus, Delete, Download } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import PostSearch from './components/post-search.vue';
  import PostEdit from './components/post-edit.vue';
  import { pagePosts, removePosts, exportPosts } from '@/api/system/post';

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
      prop: 'postCode',
      label: '岗位编码',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'postName',
      label: '岗位名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'postSort',
      label: '岗位排序',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status',
      filters: [
        { text: '正常', value: '0' },
        { text: '停用', value: '1' }
      ],
      filterMultiple: false, // 只能选一个
      filterMethod: (value, row) => {
        if (value === '') return true; // 选 "全部" 显示所有数据
        return row.status == value; // 选 "正常" 或 "停用" 进行筛选
      }
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
      width: 140,
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
  const datasource = ({ page, limit, where, orders }) => {
    return pagePosts({ ...where, ...orders, pageNum: page, pageSize: limit });
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
      `是否确认删除岗位编码为"${rows.map((d) => d.postCode).join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removePosts(rows.map((d) => d.postId))
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
      exportPosts({ ...where, ...orders })
        .then(() => {
          loading.close();
        })
        .catch((e) => {
          loading.close();
          EleMessage.error(e.message);
        });
    });
  };

  /** 导出和打印全部数据的数据源 */
  const exportSource = ({ where, orders }) => {
    return pagePosts({ ...where, ...orders });
  };
</script>

<script>
  export default {
    name: 'SystemPost'
  };
</script>
