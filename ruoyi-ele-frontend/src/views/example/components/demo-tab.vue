<template>
  <ele-card header="页签操作">
    <div style="display: flex; align-items: center; padding-bottom: 8px">
      <div style="flex-shrink: 0; padding-right: 12px">操作指定页签:</div>
      <div style="flex: 1; max-width: 160px">
        <el-select
          clearable
          v-model="tabPath"
          placeholder="请选择页签"
          class="ele-fluid"
          :popper-options="{ strategy: 'fixed' }"
        >
          <el-option
            v-for="(item, index) in tabs"
            :key="item.key"
            :label="item.title"
            :value="item.fullPath || index"
          />
        </el-select>
      </div>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 460px; max-width: 100%">
      <el-button
        type="primary"
        style="margin: 16px 12px 0 0"
        @click="handleUpdate2"
      >
        修改页签标题
      </el-button>
      <el-button
        type="primary"
        style="margin: 16px 12px 0 0"
        @click="handleUpdate3"
      >
        修改页签为不可关闭
      </el-button>
      <el-button
        type="primary"
        style="margin: 16px 12px 0 0"
        @click="handleClose2"
      >
        关闭页签
      </el-button>
      <el-button
        type="primary"
        style="margin: 16px 12px 0 0"
        @click="handleClose3"
      >
        关闭当前页签并切换至此页签
      </el-button>
      <el-button
        type="primary"
        style="margin: 16px 12px 0 0"
        @click="handleCloseAndRefresh"
      >
        关闭当前页签并刷新至此页签
      </el-button>
    </div>
    <div style="margin: 42px 0 16px 0">操作当前页签:</div>
    <div style="display: flex; flex-wrap: wrap">
      <el-button
        type="primary"
        style="margin: 0 12px 16px 0"
        @click="handleRefresh"
      >
        刷新当前页签
      </el-button>
      <el-button
        type="primary"
        style="margin: 0 12px 16px 0"
        @click="handleUpdate"
      >
        修改当前页签标题
      </el-button>
      <el-button
        type="primary"
        style="margin: 0 12px 16px 0"
        @click="handleClose"
      >
        关闭当前页签
      </el-button>
      <el-button
        type="primary"
        style="margin: 0 12px 16px 0"
        @click="handleCloseAll"
      >
        关闭全部页签
      </el-button>
    </div>
  </ele-card>
</template>

<script setup>
  import { ref, unref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useThemeStore } from '@/store/modules/theme';
  import { usePageTab } from '@/utils/use-page-tab';

  const {
    reloadPageTab,
    setPageTabTitle,
    finishPageTab,
    removeAllPageTab,
    getRouteTabKey,
    setPageTab,
    removePageTab,
    routeTabKey
  } = usePageTab();

  const { currentRoute, push } = useRouter();

  /** 当前打开的页签 */
  const themeStore = useThemeStore();
  const { tabs } = storeToRefs(themeStore);

  /** 刷新当前页签 */
  const handleRefresh = () => {
    reloadPageTab();
  };

  /** 修改当前页签标题 */
  const handleUpdate = () => {
    setPageTabTitle('新的标题');
  };

  /** 关闭当前页签 */
  const handleClose = () => {
    finishPageTab();
  };

  /** 关闭全部页签 */
  const handleCloseAll = () => {
    removeAllPageTab({ active: getRouteTabKey() });
  };

  /** 下拉框选中 */
  const tabPath = ref('');

  /** 修改指定页签标题 */
  const handleUpdate2 = () => {
    if (
      !tabPath.value ||
      !tabs.value.some((t) => t.fullPath === tabPath.value)
    ) {
      tabPath.value = '';
      EleMessage.error('请选择页签');
      return;
    }
    setPageTab({
      path: tabPath.value,
      title: '新的标题'
    });
  };

  /** 修改指定页签为不可关闭 */
  const handleUpdate3 = () => {
    if (
      !tabPath.value ||
      !tabs.value.some((t) => t.fullPath === tabPath.value)
    ) {
      tabPath.value = '';
      EleMessage.error('请选择页签');
      return;
    }
    setPageTab({
      path: tabPath.value,
      closable: false
    });
  };

  /** 关闭指定页签 */
  const handleClose2 = () => {
    if (!tabPath.value) {
      EleMessage.error('请选择页签');
      return;
    }
    const t = tabs.value.find((t) => t.fullPath === tabPath.value);
    if (!t) {
      tabPath.value = '';
      EleMessage.error('请选择页签');
      return;
    }
    if (t.path === unref(currentRoute).path) {
      handleClose();
      return;
    }
    removePageTab({
      key: tabPath.value,
      active: getRouteTabKey()
    });
  };

  /** 关闭当前页签并切换至指定页签 */
  const handleClose3 = () => {
    if (!tabPath.value) {
      EleMessage.error('请选择页签');
      return;
    }
    const t = tabs.value.find((t) => t.fullPath === tabPath.value);
    if (!t) {
      tabPath.value = '';
      EleMessage.error('请选择页签');
      return;
    }
    if (!tabs.value.find((t) => t.key === routeTabKey)?.closable) {
      EleMessage.error('当前页签不可关闭');
      return;
    }
    if (t.path === routeTabKey) {
      handleRefresh();
      return;
    }
    removePageTab({ key: routeTabKey });
    push(tabPath.value);
  };

  /** 关闭当前页签并切换至指定页签并刷新指定页签 */
  const handleCloseAndRefresh = () => {
    if (!tabPath.value) {
      EleMessage.error('请选择页签');
      return;
    }
    const t = tabs.value.find((t) => t.fullPath === tabPath.value);
    if (!t) {
      tabPath.value = '';
      EleMessage.error('请选择页签');
      return;
    }
    if (!tabs.value.find((t) => t.key === routeTabKey)?.closable) {
      EleMessage.error('当前页签不可关闭');
      return;
    }
    if (t.path === routeTabKey) {
      handleRefresh();
      return;
    }
    removePageTab({ key: routeTabKey });
    reloadPageTab({ fullPath: tabPath.value });
  };
</script>
