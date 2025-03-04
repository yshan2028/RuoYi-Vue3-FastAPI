<template>
  <ele-page>
    <!-- 搜索表单 -->
    <dept-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        sticky
        ref="tableRef"
        row-key="deptId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        :export-config="{ fileName: '部门信息', datasource: exportSource }"
        :print-config="{ datasource: exportSource }"
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
              @click="openEdit(null, row.deptId)"
            >
              添加
            </el-link>
            <el-divider direction="vertical" style="margin: 0 8px" />
            <el-link type="primary" :underline="false" @click="openEdit(row)">
              修改
            </el-link>
            <template v-if="row.parentId !== 0">
              <el-divider direction="vertical" style="margin: 0 8px" />
              <el-link type="danger" :underline="false" @click="remove(row)">
                删除
              </el-link>
            </template>
          </div>
        </template>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <dept-edit
      v-model="showEdit"
      :data="current"
      :parent-id="parentId"
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
      prop: 'deptName',
      label: '部门名称',
      minWidth: 160
    },
    {
      prop: 'orderNum',
      label: '排序',
      align: 'center',
      minWidth: 90
    },
    {
      prop: 'status',
      label: '状态',
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
      width: 180,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 上级菜单id */
  const parentId = ref();

  /** 表格数据源 */
  const datasource = async ({ where }) => {
    const data = await listDepts({ ...where });
    return toTree({
      data,
      idField: 'deptId',
      parentIdField: 'parentId'
    });
  };

  /** 刷新表格 */
  const reload = (where) => {
    tableRef.value?.reload?.({ where });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row, id) => {
    current.value = row ?? null;
    parentId.value = id;
    showEdit.value = true;
  };

  /** 删除单个 */
  const remove = (row) => {
    ElMessageBox.confirm(
      `是否确认删除名称为“${row.deptName}”的数据项？`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeDept(row.deptId)
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

  /** 导出和打印全部数据的数据源 */
  const exportSource = ({ where, orders }) => {
    return listDepts({ ...where, ...orders });
  };
</script>

<script>
  export default {
    name: 'SystemDept'
  };
</script>
