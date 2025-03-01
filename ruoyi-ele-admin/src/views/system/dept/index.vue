<template>
  <ele-page>
    <!-- 搜索表单 -->
    <dept-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        sticky
        ref="tableRef"
        row-key="dept_id"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        highlight-current-row
        :default-expand-all="true"
        :pagination="false"
        cache-key="systemDeptTable"
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
            class="ele-btn-icon"
            :icon="ColumnHeightOutlined"
            @click="expandAll"
          >
            展开全部
          </el-button>
          <el-button
            class="ele-btn-icon"
            :icon="VerticalAlignMiddleOutlined"
            @click="foldAll"
          >
            折叠全部
          </el-button>
        </template>
        <template #status="{ row }">
          <dict-data
            :model-value="row.status"
            type="tag"
            code="sys_normal_disable"
          />
        </template>
        <template #action="{ row }">
          <div style="display: inline-flex; align-items: center">
            <el-link
              type="primary"
              :underline="false"
              @click="openEdit(null, row.dept_id)"
            >
              添加
            </el-link>
            <el-divider direction="vertical" style="margin: 0 8px" />
            <el-link type="primary" :underline="false" @click="openEdit(row)">
              修改
            </el-link>
            <el-divider direction="vertical" style="margin: 0 8px" />
            <el-link type="danger" :underline="false" @click="remove(row)">
              删除
            </el-link>
          </div>
        </template>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <dept-edit
      v-model="showEdit"
      :data="current"
      :parent-id="parent_id"
      @done="reload"
    />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { Plus } from '@element-plus/icons-vue';
  import { EleMessage, toTree } from 'ele-admin-plus/es';
  import {
    ColumnHeightOutlined,
    VerticalAlignMiddleOutlined
  } from '@/components/icons';
  import DeptSearch from './components/dept-search.vue';
  import DeptEdit from './components/dept-edit.vue';
  import { listDepts, removeDept } from '@/api/system/dept';

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center',
      fixed: 'left'
    },
    {
      prop: 'dept_name',
      label: '部门名称',
      minWidth: 160
    },
    {
      prop: 'order_num',
      label: '排序',
      align: 'center',
      minWidth: 90
    },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      slot: 'status',
      minWidth: 90
    },
    {
      prop: 'create_time',
      label: '创建时间',
      align: 'center',
      minWidth: 110
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 180,
      align: 'center',
      slot: 'action'
    }
  ]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 上级菜单id */
  const parent_id = ref();

  /** 表格数据源 */
  const datasource = async ({ where }) => {
    const data = await listDepts({ ...where });
    return toTree({
      data,
      idField: 'dept_id',
      parentIdField: 'parent_id'
    });
  };

  /** 刷新表格 */
  const reload = (where) => {
    tableRef.value?.reload?.({ where });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row, id) => {
    current.value = row ?? null;
    parent_id.value = id;
    showEdit.value = true;
  };

  /** 删除单个 */
  const remove = (row) => {
    ElMessageBox.confirm(
      `是否确认删除名称为“${row.dept_name}”的数据项？`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeDept(row.dept_id)
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

  /** 展开全部 */
  const expandAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(true);
  };

  /** 折叠全部 */
  const foldAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(false);
  };
</script>

<script>
  export default {
    name: 'SystemDept'
  };
</script>
