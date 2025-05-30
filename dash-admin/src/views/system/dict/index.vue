<template>
  <ele-page
    flex-table
    :multi-card="false"
    hide-footer
    style="min-height: 420px"
  >
    <ele-card
      flex-table
      :body-style="{ padding: '0 0 0 16px', overflow: 'hidden' }"
    >
      <ele-split-panel
        ref="splitRef"
        flex-table
        size="256px"
        allow-collapse
        :custom-style="{ borderWidth: '0 1px 0 0', padding: '16px 0' }"
        :body-style="{ padding: '16px 16px 0 0', overflow: 'hidden' }"
        :style="{ height: '100%', overflow: 'visible' }"
      >
        <div style="padding: 0 16px 12px 0">
          <el-input
            clearable
            v-model="keywords"
            placeholder="输入字典名称搜索"
            :prefix-icon="SearchOutlined"
          />
        </div>
        <div style="margin-bottom: 12px">
          <el-button
            type="primary"
            class="ele-btn-icon"
            :icon="PlusOutlined"
            v-permission="'system:dict:add'"
            @click="openEdit()"
          >
            新建
          </el-button>
          <el-button
            type="warning"
            :disabled="!current"
            class="ele-btn-icon"
            :icon="EditOutlined"
            v-permission="'system:dict:edit'"
            @click="openEdit(current)"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            :disabled="!current"
            class="ele-btn-icon"
            :icon="DeleteOutlined"
            v-permission="'system:dict:remove'"
            @click="remove"
          >
            删除
          </el-button>
        </div>
        <ele-loading
          :loading="loading"
          :style="{ flex: 1, paddingRight: '16px', overflow: 'auto' }"
        >
          <el-tree
            ref="treeRef"
            :data="data"
            highlight-current
            node-key="dictId"
            :expand-on-click-node="false"
            :default-expand-all="true"
            :filter-node-method="filterNode"
            :style="{
              '--ele-tree-item-height': '34px',
              '--ele-tree-expand-padding': 0,
              '--ele-tree-expand-margin': 0
            }"
            @node-click="handleNodeClick"
          >
            <template #default="{ data: d }">
              <div
                class="el-tree-node__label"
                :style="{
                  display: 'flex',
                  alignItems: 'center',
                  color: d.status == 0 ? void 0 : 'red'
                }"
              >
                <div style="margin-right: 4px">{{ d.dictName }}</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: normal">
                  ({{ d.dictType }})
                </div>
              </div>
            </template>
          </el-tree>
        </ele-loading>
        <template #body>
          <dict-data-list
            v-if="current && current.dictType"
            :dict-type="current.dictType"
          />
        </template>
      </ele-split-panel>
    </ele-card>
    <!-- 编辑弹窗 -->
    <dict-edit v-model="showEdit" :data="editData" @done="query" />
  </ele-page>
</template>

<script setup>
  import { ref, nextTick, watch } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined
  } from '@/components/icons';
  import { useMobile } from '@/utils/use-mobile';
  import DictDataList from './components/dict-data-list.vue';
  import DictEdit from './components/dict-edit.vue';
  import { listDicts, removeDict } from '@/api/system/dict';

  defineOptions({ name: 'SystemDict' });

  /** 是否是移动端 */
  const { mobile } = useMobile();

  /** 分割面板组件 */
  const splitRef = ref(null);

  /** 树组件 */
  const treeRef = ref(null);

  /** 加载状态 */
  const loading = ref(true);

  /** 树形数据 */
  const data = ref([]);

  /** 选中数据 */
  const current = ref(null);

  /** 部门搜索关键字 */
  const keywords = ref('');

  /** 是否显示编辑弹窗 */
  const showEdit = ref(false);

  /** 编辑回显数据 */
  const editData = ref(null);

  /** 查询 */
  const query = () => {
    loading.value = true;
    listDicts()
      .then((list) => {
        loading.value = false;
        data.value = list ?? [];
        nextTick(() => {
          handleNodeClick(data.value[0]);
        });
      })
      .catch((e) => {
        loading.value = false;
        EleMessage.error(e.message);
      });
  };

  /** 选择数据 */
  const handleNodeClick = (row) => {
    // 移动端自动收起左侧
    if (current.value != null && mobile.value) {
      splitRef.value?.toggleCollapse?.(true);
    }
    if (row && row.dictId) {
      current.value = row;
      treeRef.value?.setCurrentKey?.(row.dictId);
    } else {
      current.value = null;
    }
  };

  /** 打开编辑弹窗 */
  const openEdit = (row) => {
    editData.value = row ?? null;
    showEdit.value = true;
  };

  /** 删除 */
  const remove = () => {
    const id = current.value?.dictId;
    const name = current.value?.dictType;
    ElMessageBox.confirm(
      `是否确认删除字典类型为"${name}"的数据项？`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = EleMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeDict(id)
          .then(() => {
            loading.close();
            EleMessage.success('删除成功');
            query();
          })
          .catch((e) => {
            loading.close();
            EleMessage.error(e.message);
          });
      })
      .catch(() => {});
  };

  /** 树过滤方法 */
  const filterNode = (value, data) => {
    if (value) {
      return data.dictName && data.dictName.includes(value);
    }
    return true;
  };

  /** 树过滤 */
  watch(keywords, (value) => {
    treeRef.value?.filter?.(value);
  });

  query();
</script>
