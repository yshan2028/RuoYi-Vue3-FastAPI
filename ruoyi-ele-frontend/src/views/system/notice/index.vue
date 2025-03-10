<template>
  <ele-page>
    <!-- 搜索表单 -->
    <notice-search @search="reload" />
    <ele-card :body-style="{ paddingTop: '8px' }">
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="noticeId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        highlight-current-row
        :export-config="{ fileName: '通知公告' }"
        cache-key="systemNoticeTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            v-permission="'system:notice:add'"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            type="danger"
            class="ele-btn-icon"
            :icon="DeleteOutlined"
            v-permission="'system:notice:remove'"
            @click="removeBatch()"
          >
            删除
          </el-button>
        </template>
        <template #status="{ row }">
          <dict-data
            code="sys_notice_status"
            type="tag"
            :model-value="row.status"
          />
        </template>
        <template #noticeType="{ row }">
          <dict-data
            code="sys_notice_type"
            type="tag"
            :model-value="row.noticeType"
          />
        </template>
        <template #action="{ row }">
          <el-link
            v-permission="'system:notice:edit'"
            type="primary"
            :underline="false"
            @click="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider
            v-permission="['system:notice:edit', 'system:notice:remove']"
            direction="vertical"
          />
          <el-link
            v-permission="'system:notice:remove'"
            type="danger"
            :underline="false"
            @click="removeBatch(row)"
          >
            删除
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
    <!-- 编辑弹窗 -->
    <notice-edit v-model="showEdit" :data="current" @done="reload" />
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { PlusOutlined, DeleteOutlined } from '@/components/icons';
  import { useDictData } from '@/utils/use-dict-data';
  import NoticeSearch from './components/notice-search.vue';
  import NoticeEdit from './components/notice-edit.vue';
  import { pageNotices, removeNotices } from '@/api/system/notice';

  defineOptions({ name: 'SystemNotice' });

  /** 字典数据 */
  const [typeDicts, statusDicts] = useDictData([
    'sys_notice_type',
    'sys_notice_status'
  ]);

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
      prop: 'noticeTitle',
      label: '公告标题',
      minWidth: 160
    },
    {
      prop: 'noticeType',
      label: '公告类型',
      width: 90,
      align: 'center',
      slot: 'noticeType',
      formatter: (row) =>
        typeDicts.value.find((d) => d.dictValue == row.noticeType)?.dictLabel
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
      prop: 'createBy',
      label: '创建者',
      width: 100,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180,
      align: 'center'
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 120,
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

  /** 表格数据源 */
  const datasource = ({ pages, where, orders }) => {
    return pageNotices({ ...where, ...orders, ...pages });
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
    const ids = rows.map((d) => d.noticeId);
    ElMessageBox.confirm(
      `是否确认删除公告编号为"${ids.join()}"的数据项?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeNotices(ids)
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
</script>
