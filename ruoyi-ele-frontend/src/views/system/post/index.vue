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
        highlight-current-row
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
      minWidth: 110,
      slot: 'status'
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
</script>

<script>
  export default {
    name: 'SystemPost'
  };
</script>
