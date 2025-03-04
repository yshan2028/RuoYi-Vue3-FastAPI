<template>
  <user-search ref="searchRef" style="margin-bottom: -14px" @search="reload" />
  <!-- 表格 -->
  <ele-pro-table
    ref="tableRef"
    row-key="userId"
    :columns="columns"
    :datasource="datasource"
    :show-overflow-tooltip="true"
    v-model:selections="selections"
    :highlight-current-row="true"
    :export-config="{ fileName: '用户数据', datasource: exportSource }"
    :print-config="{ datasource: exportSource }"
    :footer-style="{ paddingBottom: '16px' }"
    cache-key="systemUserTable"
  >
    <template #toolbar>
      <el-button
        type="primary"
        class="ele-btn-icon"
        :icon="PlusOutlined"
        v-permission="'system:user:add'"
        @click="openEdit()"
      >
        新建
      </el-button>
      <el-button
        type="danger"
        class="ele-btn-icon hidden-sm-and-down"
        :icon="DeleteOutlined"
        v-permission="'system:user:remove'"
        @click="removeBatch()"
      >
        删除
      </el-button>
      <el-button
        class="ele-btn-icon"
        :icon="UploadOutlined"
        v-permission="'system:user:import'"
        @click="openImport"
      >
        导入
      </el-button>
      <el-button
        class="ele-btn-icon"
        :icon="DownloadOutlined"
        v-permission="'system:user:export'"
        @click="exportData"
      >
        导出
      </el-button>
    </template>
    <template #userName="{ row }">
      <el-link type="primary" :underline="false" @click="openDetail(row)">
        {{ row.userName }}
      </el-link>
    </template>
    <template #status="{ row }">
      <el-switch
        size="small"
        :model-value="row.status == 0"
        @change="(checked) => editStatus(checked, row)"
      />
    </template>
    <template #action="{ row }">
      <el-link
        type="primary"
        :underline="false"
        v-permission="'system:user:edit'"
        :disabled="row.userId === 1"
        @click="row.userId !== 1 && openEdit(row)"
      >
        修改
      </el-link>
      <el-divider v-permission="'system:user:remove'" direction="vertical" />
      <el-link
        type="danger"
        :underline="false"
        v-permission="'system:user:remove'"
        :disabled="row.userId === 1"
        @click="row.userId !== 1 && removeBatch(row)"
      >
        删除
      </el-link>
      <el-divider v-if="moreItems.length" direction="vertical" />
      <ele-dropdown
        v-if="moreItems.length"
        :items="moreItems"
        style="display: inline"
        @command="(key) => row.userId !== 1 && dropClick(key, row)"
      >
        <el-link type="primary" :underline="false" :disabled="row.userId === 1">
          <span>更多</span>
          <el-icon :size="12" style="vertical-align: -1px; margin-left: 2px">
            <arrow-down />
          </el-icon>
        </el-link>
      </ele-dropdown>
    </template>
  </ele-pro-table>
  <!-- 编辑弹窗 -->
  <user-edit
    :data="current"
    v-model="showEdit"
    :dept-id="deptId"
    @done="reload"
  />
  <!-- 编辑弹窗 -->
  <user-detail
    :data="current"
    v-model="showDetail"
    :userId="current"
    @done="reload"
  />
  <!-- 导入弹窗 -->
  <user-import v-model="showImport" @done="reload" />
  <!-- 分配角色弹窗 -->
  <user-role v-model="showRole" :data="current" />
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    PlusOutlined,
    DeleteOutlined,
    ArrowDown,
    UploadOutlined,
    DownloadOutlined
  } from '@/components/icons';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { usePermission } from '@/utils/use-permission';
  import UserSearch from './user-search.vue';
  import UserEdit from './user-edit.vue';
  import UserDetail from './user-details.vue';
  import UserImport from './user-import.vue';
  import UserRole from './user-role.vue';
  import {
    pageUsers,
    removeUsers,
    updateUserStatus,
    updateUserPassword,
    exportUsers
  } from '@/api/system/user';

  const props = defineProps({
    /** 部门id */
    deptId: Number
  });

  const { hasPermission } = usePermission();

  /** 搜索栏实例 */
  const searchRef = ref(null);

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 40,
      align: 'center',
      fixed: 'left'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 40,
      align: 'center',
      fixed: 'left'
    },
    {
      prop: 'userName',
      label: '用户账号',
      align: 'center',
      minWidth: 110,
      slot: 'userName'
    },
    {
      prop: 'nickName',
      label: '用户昵称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'dept.deptName',
      label: '部门',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'email',
      label: '用户邮箱',
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
      prop: 'loginDate',
      label: '最后登录时间',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'remark',
      label: '备注',
      align: 'center',
      minWidth: 110
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

  /** 表格选中数据 */
  const selections = ref([]);

  /** 当前编辑数据 */
  const current = ref(null);

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 控制详情弹窗的显示状态 */
  const showDetail = ref(false);

  /** 是否显示用户导入弹窗 */
  const showImport = ref(false);

  /** 是否显示分配角色弹窗 */
  const showRole = ref(false);

  /** 操作列更多下拉菜单 */
  const moreItems = computed(() => {
    const items = [];
    if (hasPermission('system:user:resetPwd')) {
      items.push({ title: '重置密码', command: 'password' });
    }
    if (hasPermission('system:user:edit')) {
      items.push({ title: '分配角色', command: 'role' });
    }
    return items;
  });

  /** 表格数据源 */
  const datasource = ({ page, limit, where, orders }) => {
    return pageUsers({
      ...where,
      ...orders,
      pageNum: page,
      pageSize: limit,
      deptId: props.deptId
    });
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

  /** 点击用户名时打开详情弹窗 */
  const openDetail = async (row) => {
    current.value = row.userId;
    showDetail.value = true;  // 显示弹窗
  };

  /** 打开编辑弹窗 */
  const openImport = () => {
    showImport.value = true;
  };

  /** 批量删除 */
  const removeBatch = (row) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      EleMessage.error('请至少选择一条数据');
      return;
    }
    ElMessageBox.confirm(
      `是否确认删除用户名称为"${rows.map((d) => d.userName).join()}"的数据项？`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        removeUsers(rows.map((d) => d.userId))
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

  /** 修改用户状态 */
  const editStatus = (checked, row) => {
    const status = checked ? '0' : '1';
    updateUserStatus(row.userId, status)
      .then((msg) => {
        row.status = status;
        EleMessage.success(msg);
      })
      .catch((e) => {
        EleMessage.error(e.message);
      });
  };

  /** 下拉菜单点击事件 */
  const dropClick = (key, row) => {
    if (key === 'password') {
      ElMessageBox.prompt(`请输入"${row.userName}"的新密码:`, '重置密码', {
        inputPlaceholder: '请输入5-18位非空白字符',
        inputPattern: /^[\S]{5,18}$/,
        inputErrorMessage: '密码必须为5-18位非空白字符',
        customStyle: { '--ele-message-box-body-padding': '4px 20px 0 20px' },
        draggable: true
      })
        .then(({ value }) => {
          updateUserPassword(row.userId, value)
            .then((msg) => {
              EleMessage.success(msg);
            })
            .catch((e) => {
              EleMessage.error(e.message);
            });
        })
        .catch(() => {});
    } else if (key === 'role') {
      current.value = row ?? null;
      showRole.value = true;
    }
  };

  /** 导出数据 */
  const exportData = () => {
    const loading = EleMessage.loading('请求中..');
    tableRef.value?.fetch?.(({ where, orders, filters }) => {
      exportUsers({ ...where, ...orders, ...filters })
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
    return pageUsers({ ...where, ...orders });
  };

  // 监听机构 id 变化
  watch(
    () => props.deptId,
    () => {
      searchRef.value?.resetFields?.();
      reload({});
    }
  );
</script>
