<template>
  <ele-drawer
    :size="980"
    style="max-width: 100%"
    title="分配用户"
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="modelValue"
    @update:modelValue="updateModelValue"
  >
    <role-user-search style="margin-bottom: -8px" @search="reload" />
    <ele-pro-table
      ref="tableRef"
      row-key="user_id"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
    >
      <template #toolbar>
        <el-button
          type="primary"
          class="ele-btn-icon"
          :icon="Plus"
          @click="openEdit()"
        >
          添加用户
        </el-button>
        <el-button
          type="danger"
          class="ele-btn-icon"
          :icon="Delete"
          @click="removeBatch()"
        >
          批量取消
        </el-button>
      </template>
      <template #status="{ row }">
        <dict-data
          code="sys_common_status"
          type="tag"
          :model-value="row.status"
        />
      </template>
      <template #action="{ row }">
        <el-link type="danger" :underline="false" @click="removeBatch(row)">
          取消授权
        </el-link>
      </template>
    </ele-pro-table>
  </ele-drawer>
  <!-- 选择用户弹窗 -->
  <role-user-select v-model="showEdit" :role-id="data?.role_id" @done="reload" />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { Plus, Delete } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import RoleUserSearch from './role-user-search.vue';
  import RoleUserSelect from './role-user-select.vue';
  import { listRoleUsers, removeRoleUsers } from '@/api/system/role';

  const emit = defineEmits(['update:modelValue']);

  const props = defineProps({
    /** 是否显示 */
    modelValue: Boolean,
    /** 角色 */
    data: Object
  });

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
      prop: 'user_name',
      label: '用户名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'nick_name',
      label: '用户昵称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'email',
      label: '邮箱',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'phonenumber',
      label: '手机号码',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status'
    },
    {
      prop: 'create_time',
      label: '创建时间',
      align: 'center',
      width: 168
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 88,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 表格数据源 */
  const datasource = ({ page, limit, where }) => {
    return listRoleUsers({
      ...where,
      pageNum: page,
      pageSize: limit,
      role_id: props.data?.role_id
    });
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ where });
  };

  /** 添加用户 */
  const openEdit = () => {
    showEdit.value = true;
  };

  /** 批量取消 */
  const removeBatch = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    ElMessageBox.confirm(
      `确认要取消该用户“${rows.map((d) => d.user_name).join()}”的角色吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeRoleUsers({
          role_id: props.data?.role_id,
          userIds: rows.map((d) => d.user_id).join()
        })
          .then(() => {
            loading.close();
            EleMessage.success('取消授权成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 更新modelValue */
  const updateModelValue = (value) => {
    emit('update:modelValue', value);
  };

  watch(
    () => props.modelValue,
    (modelValue) => {
      if (modelValue && props.data) {
        reload();
      } else {
        selections.value = [];
      }
    }
  );
</script>
