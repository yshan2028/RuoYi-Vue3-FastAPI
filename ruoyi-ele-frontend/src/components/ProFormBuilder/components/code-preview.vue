<!-- eslint-disable vue/no-v-html -->
<template>
  <EleModal
    :width="980"
    title="代码预览"
    position="center"
    v-model="visible"
    :bodyStyle="{
      height: 'calc(100vh - 66px)',
      maxHeight: 'calc(100dvh - 66px)',
      padding: '6px 8px'
    }"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div class="form-builder-code-view">
      <div class="form-builder-code-header">
        <div class="form-builder-code-tabs">
          <div
            v-for="item in tabs"
            :key="item.value"
            :class="[
              'form-builder-code-tab',
              { 'is-active': active === item.value }
            ]"
            @click="handleTabClick(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="form-builder-code-tools">
          <EleCopyable
            :text="data.code"
            :iconProps="{ style: { color: '#d6dde3' } }"
            :tooltip="{
              placement: 'bottom',
              bg: '#383838',
              arrowBg: '#383838',
              hideAfter: 0
            }"
          />
          <EleTooltip
            content="下载"
            placement="bottom"
            bg="#383838"
            arrowBg="#383838"
            :hideAfter="0"
            :offset="6"
          >
            <ElIcon class="form-builder-code-icon-tool" @click="handleDownload">
              <DownloadOutlined />
            </ElIcon>
          </EleTooltip>
        </div>
      </div>
      <div class="form-builder-code-body">
        <div class="form-builder-code-line-numbers">
          <div v-for="n in data.lines" :key="n">{{ n }}</div>
        </div>
        <pre v-html="data.html"></pre>
      </div>
    </div>
  </EleModal>
</template>

<script setup>
  import { ref } from 'vue';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github-dark.css';
  import xml from 'highlight.js/lib/languages/xml';
  import {
    generateProFormCode,
    generateElFormCode
  } from 'ele-admin-plus/es/ele-pro-form-builder/components/code-generator';
  import { DownloadOutlined } from '@/components/icons';
  import { download } from '@/utils/common';
  import { useFormData } from '@/utils/use-form-data';

  hljs.registerLanguage('vue', xml);

  const props = defineProps({
    /** 配置数据 */
    config: Object,
    /** 组件库数据 */
    componentData: Array
  });

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 数据 */
  const [data, resetData, assignData] = useFormData({
    code: '',
    html: '',
    lines: [1]
  });

  /** 代码生成的数据 */
  const generateData = [{}, {}];

  /** 选项卡 */
  const tabs = ref([
    { label: 'ProForm', value: 0 },
    { label: 'ElForm', value: 1 }
  ]);

  /** 选项卡选中 */
  const active = ref(0);

  /** 选项卡点击事件 */
  const handleTabClick = (value, force) => {
    if (!force && active.value === value) {
      return;
    }
    active.value = value;
    assignData(generateData[active.value]);
  };

  /** 下载 */
  const handleDownload = () => {
    download(data.code, 'index.vue', 'text/plain;charset=utf-8');
  };

  /** 弹窗关闭事件 */
  const handleClosed = () => {
    generateData[0] = {};
    generateData[1] = {};
    resetData();
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    const proCode = generateProFormCode(props.config);
    const proHtml = hljs.highlight(proCode, { language: 'vue' }).value;
    generateData[0] = {
      code: proCode,
      html: proHtml,
      lines: proHtml.split('\n').map((_, i) => i + 1)
    };
    const elCode = generateElFormCode(props.config, props.componentData);
    const elHtml = hljs.highlight(elCode, { language: 'vue' }).value;
    generateData[1] = {
      code: elCode,
      html: elHtml,
      lines: elHtml.split('\n').map((_, i) => i + 1)
    };
    handleTabClick(active.value, true);
  };
</script>

<style lang="scss" scoped>
  .form-builder-code-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid #000;
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
  }

  .form-builder-code-body {
    flex: 1;
    color: #e6edf3;
    box-sizing: border-box;
    overflow: auto;
    display: flex;
    align-items: flex-start;
    --ele-scrollbar-color: #5e5e5e;
    --ele-scrollbar-hover-color: #707070;

    & > pre {
      flex: 1;
      margin: 0;
      padding: 12px;
      box-sizing: border-box;
      font-family: monospace;
    }
  }

  .form-builder-code-line-numbers {
    flex-shrink: 0;
    color: #8b949e;
    font-family: monospace;
    padding: 12px 0;
    min-width: 38px;
    background: #1e1e1e;
    border-right: 1px solid #000;
    box-sizing: border-box;
    text-align: center;
    user-select: none;
    position: sticky;
    left: 0;

    & > div {
      max-height: 100%;
    }
  }

  .form-builder-code-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #000;
    box-sizing: border-box;
  }

  .form-builder-code-tools {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 6px 16px 6px 0;

    & > .ele-copyable {
      border-radius: 4px;
      background: #444444;
      transition: background-color 0.2s;

      :deep(.ele-copyable-icon) {
        padding: 4px;
        margin: 0;
      }

      &:hover {
        background: #707070;
      }
    }
  }

  .form-builder-code-icon-tool {
    width: auto;
    height: auto;
    font-size: 15px;
    color: #d6dde3;
    background: #444444;
    padding: 4px;
    margin-left: 8px;
    border-radius: 4px;
    box-sizing: border-box;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background: #707070;
    }
  }

  .form-builder-code-tabs {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .form-builder-code-tab {
    height: 35px;
    line-height: 35px;
    color: #e6edf3;
    font-weight: bold;
    font-family: monospace;
    padding: 0 2px;
    margin: 0 0 0 16px;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    box-sizing: border-box;
    user-select: none;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
      border-bottom-color: var(--el-color-primary);
    }
  }
</style>
