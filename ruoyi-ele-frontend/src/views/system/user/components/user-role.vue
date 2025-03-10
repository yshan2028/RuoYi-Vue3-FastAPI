<template>
  <ele-modal
    :width="640"
    title="分配角色"
    :body-style="{ padding: '4px 16px 8px 16px' }"
    :destroy-on-close="true"
    v-model="visible"
    @open="handleOpen"
  >
    <ele-pro-table
      ref="tableRef"
      row-key="roleId"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
      :pagination="false"
      :toolbar="false"
      :empty-props="false"
    />
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, nextTick } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { getUserRole, setUserRole } from '@/api/system/user';

  const props = defineProps({
    /** 用户 */
    data: Object
  });

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

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
      prop: 'roleName',
      label: '角色名称',
      minWidth: 110
    },
    {
      prop: 'roleKey',
      label: '权限字符',
      minWidth: 110
    },
    {
      prop: 'createTime',
      label: '创建时间',
      align: 'center',
      width: 180
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格数据源 */
  const datasource = ref([]);

  /** 提交状态 */
  const loading = ref(false);

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    loading.value = true;
    const roleIds = selections.value.map((d) => d.roleId).join();
    setUserRole({ userId: props.data?.userId, roleIds })
      .then(() => {
        loading.value = false;
        EleMessage.success('授权成功');
        handleCancel();
      })
      .catch((e) => {
        loading.value = false;
        EleMessage.error(e.message);
      });
  };

  /** 查询 */
  const query = () => {
    getUserRole(props.data.userId)
      .then((result) => {
        datasource.value = result.roles;
        nextTick(() => {
          tableRef.value?.setSelectedRows?.(result.roles.filter((d) => d.flag));
        });
      })
      .catch((e) => {
        EleMessage.error(e.message);
      });
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      query();
    } else {
      selections.value = [];
    }
  };
</script>
