<template>
  <ele-page>
    <!-- 搜索表单 -->
    <online-search ref="searchRef" @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="tokenId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :loading="loading"
        :highlight-current-row="true"
        :export-config="{ fileName: '在线用户信息', datasource: exportSource }"
        :print-config="{ datasource: exportSource }"
        cache-key="monitorOnlineTable"
        @refresh="reload(getWhere())"
      >
        <template #action="{ row }">
          <el-link type="danger" :underline="false" @click="kickout(row)">
            强退
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import OnlineSearch from './components/online-search.vue';
  import { pageOnlines, kickoutOnline } from '@/api/monitor/online';

  const searchRef = ref(null);

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
      prop: 'tokenId',
      label: '会话编号',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'userName',
      label: '登录名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'deptName',
      label: '部门名称',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'ipaddr',
      label: '登录地址',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'loginLocation',
      label: '登录地点',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'browser',
      label: '浏览器',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'os',
      label: '操作系统',
      align: 'center',
      minWidth: 110
    },
    {
      prop: 'loginTime',
      label: '登录时间',
      align: 'center',
      minWidth: 110,
      formatter: (row) => dayjs(row.loginTime).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 80,
      align: 'center',
      slot: 'action',
      fixed: 'right',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格数据源 */
  const datasource = ref([]);

  /** 请求状态 */
  const loading = ref(false);

  /** 搜索 */
  const reload = (where) => {
    loading.value = true;
    pageOnlines(where)
      .then((res) => {
        loading.value = false;
        datasource.value = res.rows;
        tableRef.value?.reload?.({ page: 1 });
      })
      .catch((e) => {
        loading.value = false;
        console.error(e);
      });
  };

  /** 强退 */
  const kickout = (row) => {
    ElMessageBox.confirm(
      '是否确认强退名称为“' + row.userName + '”的用户？',
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading('请求中..');
        kickoutOnline(row.tokenId)
          .then(() => {
            loading.close();
            EleMessage.success('强退成功');
            reload();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 获取当前搜索条件 */
  const getWhere = () => {
    return searchRef.value?.getWhere?.();
  };

  /** 导出和打印全部数据的数据源 */
  const exportSource = ({ where, orders }) => {
    return pageOnlines({ ...where, ...orders });
  };

  reload();
</script>

<script>
  export default {
    name: 'MonitorOnline'
  };
</script>
