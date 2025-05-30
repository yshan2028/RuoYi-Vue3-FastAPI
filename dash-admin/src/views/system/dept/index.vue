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
        highlight-current-row
        :export-config="{ fileName: '部门数据' }"
        :default-expand-all="true"
        :pagination="false"
        cache-key="systemDeptTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            v-permission="'system:dept:add'"
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
              v-permission="'system:dept:add'"
              type="primary"
              :underline="false"
              @click="openEdit(null, row.deptId)"
            >
              添加
            </el-link>
            <el-divider
              v-permission="'system:dept:add'"
              direction="vertical"
              style="margin: 0 8px"
            />
            <el-link
              v-permission="'system:dept:edit'"
              type="primary"
              :underline="false"
              @click="openEdit(row)"
            >
              修改
            </el-link>
            <template v-if="row.parentId != 0">
              <el-divider
                v-permission="'system:dept:edit'"
                direction="vertical"
                style="margin: 0 8px"
              />
              <el-link
                v-permission="'system:dept:remove'"
                type="danger"
                :underline="false"
                @click="remove(row)"
              >
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
      :organization-data="organizationData"
      @done="reload"
    />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage, toTree } from 'ele-admin-plus/es';
  import {
    PlusOutlined,
    ColumnHeightOutlined,
    VerticalAlignMiddleOutlined
  } from '@/components/icons';
  import { useDictData } from '@/utils/use-dict-data';
  import DeptSearch from './components/dept-search.vue';
  import DeptEdit from './components/dept-edit.vue';
  import { listDepts, removeDept } from '@/api/system/dept';

  defineOptions({ name: 'SystemDept' });

  /** 字典数据 */
  const [statusDicts] = useDictData(['sys_normal_disable']);

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
      minWidth: 90,
      formatter: (row) =>
        statusDicts.value.find((d) => d.dictValue == row.status)?.dictLabel
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

  /** 上级机构id */
  const parentId = ref();

  /** 机构下拉数据 */
  const organizationData = ref([]);

  /** 表格数据源 */
  const datasource = async ({ where }) => {
    const data = await listDepts({ ...where });
    organizationData.value = toTree({
      data,
      idField: 'deptId',
      parentIdField: 'parentId'
    });
    return organizationData.value;
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
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
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
</script>
