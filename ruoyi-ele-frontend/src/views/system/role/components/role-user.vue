<template>
  <ele-drawer
    :size="980"
    style="max-width: 100%"
    title="分配用户"
    :append-to-body="true"
    :destroy-on-close="true"
    v-model="visible"
    :body-style="{
      paddingBottom: 0,
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }"
    @open="handleOpen"
  >
    <role-user-search style="margin-bottom: -8px" @search="reload" />
    <ele-pro-table
      ref="tableRef"
      row-key="userId"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      highlight-current-row
      :export-config="{ fileName: '角色用户' }"
      :style="{ paddingBottom: '14px' }"
      style="flex: 1; display: flex; flex-direction: column; overflow: auto"
      :table-style="{ flex: 1, height: '100%', overflow: 'hidden' }"
    >
      <template #toolbar>
        <el-button
          type="primary"
          class="ele-btn-icon"
          :icon="PlusOutlined"
          v-permission="'system:role:add'"
          @click="openEdit()"
        >
          添加用户
        </el-button>
        <el-button
          type="danger"
          class="ele-btn-icon"
          :icon="DeleteOutlined"
          v-permission="'system:role:remove'"
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
  <role-user-select v-model="showEdit" :role-id="data?.roleId" @done="reload" />
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { PlusOutlined, DeleteOutlined } from '@/components/icons';
  import { usePermission } from '@/utils/use-permission';
  import { useDictData } from '@/utils/use-dict-data';
  import RoleUserSearch from './role-user-search.vue';
  import RoleUserSelect from './role-user-select.vue';
  import { listRoleUsers, removeRoleUsers } from '@/api/system/role';

  const props = defineProps({
    /** 角色 */
    data: Object
  });

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  const { hasPermission } = usePermission();

  /** 字典数据 */
  const [statusDicts] = useDictData(['sys_common_status']);

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = computed(() => {
    const cols = [
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
        slot: 'status',
        formatter: (row) =>
          statusDicts.value.find((d) => d.dictValue == row.status)?.dictLabel
      },
      {
        prop: 'createTime',
        label: '创建时间',
        align: 'center',
        width: 180
      }
    ];
    if (hasPermission('system:role:remove')) {
      cols.push({
        columnKey: 'action',
        label: '操作',
        width: 100,
        align: 'center',
        slot: 'action',
        fixed: 'right',
        hideInPrint: true,
        hideInExport: true
      });
    }
    return cols;
  });

  /** 表格选中数据 */
  const selections = ref([]);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where }) => {
    return listRoleUsers({ ...where, ...pages, roleId: props.data?.roleId });
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
      `确认要取消该用户“${rows.map((d) => d.userName).join()}”的角色吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeRoleUsers({
          roleId: props.data?.roleId,
          userIds: rows.map((d) => d.userId).join()
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

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      reload();
    } else {
      selections.value = [];
    }
  };
</script>
