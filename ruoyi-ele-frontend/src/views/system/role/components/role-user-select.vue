<template>
  <ele-modal
    :width="880"
    title="选择用户"
    :body-style="{ padding: '4px 16px' }"
    :destroy-on-close="true"
    v-model="visible"
    @open="handleOpen"
  >
    <role-user-search @search="reload" />
    <ele-pro-table
      ref="tableRef"
      row-key="userId"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
      :toolbar="false"
      :empty-props="false"
    >
      <template #status="{ row }">
        <dict-data
          code="sys_common_status"
          type="tag"
          :model-value="row.status"
        />
      </template>
    </ele-pro-table>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import RoleUserSearch from './role-user-search.vue';
  import { listUnallocatedUsers, addRoleUsers } from '@/api/system/role';

  const props = defineProps({
    /** 角色id */
    roleId: Number
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 提交状态 */
  const loading = ref(false);

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
      prop: 'userName',
      label: '用户名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'nickName',
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
      prop: 'createTime',
      label: '创建时间',
      align: 'center',
      width: 168
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格数据源 */
  const datasource = ({ pages, where }) => {
    return listUnallocatedUsers({ ...where, ...pages, roleId: props.roleId });
  };

  /** 搜索 */
  const reload = (where) => {
    tableRef.value?.reload?.({ page: 1, where });
  };

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    if (!selections.value.length) {
      EleMessage.error('请选择要分配的用户');
      return;
    }
    loading.value = true;
    const userIds = selections.value.map((d) => d.userId).join();
    addRoleUsers({ roleId: props.roleId, userIds })
      .then((msg) => {
        loading.value = false;
        EleMessage.success(msg);
        handleCancel();
        emit('done');
      })
      .catch((e) => {
        loading.value = false;
        EleMessage.error(e.message);
      });
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      reload();
    } else {
      selections.value = [];
    }
  };
</script>
