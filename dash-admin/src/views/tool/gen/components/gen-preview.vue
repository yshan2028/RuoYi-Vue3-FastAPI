<!-- eslint-disable vue/no-v-html -->
<template>
  <ele-modal
    :width="1100"
    title="代码预览"
    position="center"
    :header-style="{ paddingBottom: '8px' }"
    :body-style="{
      padding: '0 8px 8px 8px',
      height: 'calc(100vh - 66px)',
      maxHeight: 'calc(100dvh - 66px)'
    }"
    v-model="visible"
    :style="{ '--ele-modal-mobile-space': '8px' }"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <ele-loading
      :loading="loading"
      :spinner-style="{ background: 'transparent' }"
      class="code-wrapper"
    >
      <div class="code-menus" v-if="data.length">
        <el-tree
          ref="treeRef"
          :data="data"
          node-key="key"
          :default-expand-all="true"
          :style="{
            '--ele-tree-item-height': '24px',
            '--ele-tree-item-margin': '0px',
            '--ele-tree-item-active-color': '#fff',
            '--ele-tree-item-active-bg': '#707070',
            '--ele-tree-item-active-hover-bg': '#707070',
            '--el-tree-node-hover-bg-color': '#444444',
            '--el-tree-expand-icon-color': '#e6edf3'
          }"
          @node-click="handleNodeClick"
        >
          <template #default="{ data: d }">
            <div
              :class="[
                'el-tree-node__label',
                { 'is-active': d.key === active }
              ]"
            >
              {{ d.label }}
            </div>
          </template>
        </el-tree>
      </div>
      <gen-code v-if="current" :data="current" />
    </ele-loading>
  </ele-modal>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { previewCodePro } from '@/api/tool/gen';
  import GenCode from './gen-code.vue';

  const props = defineProps({
    /** 代码生成id */
    id: Number
  });

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 树组件 */
  const treeRef = ref(null);

  /** 请求状态 */
  const loading = ref(true);

  /** 树数据 */
  const data = ref([]);

  /** 选中数据 */
  const current = ref();

  /** 树选中 */
  const active = ref();

  /** 树点击事件 */
  const handleNodeClick = (item) => {
    if (!item.children?.length) {
      current.value = item;
      active.value = current.value.key;
    }
  };

  /** 查询 */
  const query = () => {
    loading.value = true;
    previewCodePro(props.id)
      .then((result) => {
        loading.value = false;
        data.value = result;
        current.value = data.value[0].children[0].children[0];
        active.value = current.value.key;
      })
      .catch((e) => {
        loading.value = false;
        EleMessage.error(e.message);
      });
  };

  /** 查询数据 */
  const handleOpened = () => {
    if (props.id) {
      query();
    }
  };

  /** 弹窗关闭事件 */
  const handleClosed = () => {
    current.value = void 0;
    active.value = void 0;
    data.value = [];
  };
</script>

<style lang="scss" scoped>
  .code-wrapper {
    height: 100%;
    display: flex;
    box-sizing: border-box;
    border: 1px solid #000;
    background: #272727;
    border-radius: 8px;
    overflow: hidden;
  }

  .code-menus {
    flex-shrink: 0;
    width: 280px;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    border-right: 1px solid #000;
    overflow: auto;
    --ele-scrollbar-color: #5e5e5e;
    --ele-scrollbar-hover-color: #707070;

    :deep(.el-tree-node__content) {
      position: relative;
      z-index: 0;

      & > .el-tree-node__label {
        color: #e6edf3;
        font-size: 13px;
        font-family: monospace;

        &::before {
          content: '';
          border-radius: var(--ele-tree-item-radius);
          transition: background-color 0.2s;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        &.is-active {
          color: var(--ele-tree-item-active-color);

          &::before {
            background: var(--ele-tree-item-active-bg);
          }
        }
      }

      &:hover > .el-tree-node__label.is-active::before {
        background: var(--ele-tree-item-active-hover-bg);
      }
    }

    :deep(.el-tree) {
      background: none;

      .el-tree-node__content > .el-tree-node__expand-icon.is-leaf {
        margin: 0;
        padding: 0;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .code-menus {
      width: 168px;
    }
  }
</style>
