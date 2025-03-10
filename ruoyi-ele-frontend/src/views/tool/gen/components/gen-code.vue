<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="code-view">
    <div v-if="data && data.meta" class="code-header">
      <div class="code-title">{{ data.meta.path }}</div>
      <div class="code-tools">
        <ele-copyable
          :text="data.meta.text"
          :iconProps="{ style: { color: '#d6dde3' } }"
          :tooltip="{ placement: 'bottom', bg: '#383838', arrowBg: '#383838' }"
        />
        <ele-tooltip
          content="下载"
          placement="bottom"
          :offset="6"
          bg="#383838"
          arrow-bg="#383838"
        >
          <el-icon class="code-icon-tool" @click="handleDownload">
            <DownloadOutlined />
          </el-icon>
        </ele-tooltip>
      </div>
    </div>
    <div class="code-body">
      <div class="code-line-numbers">
        <div v-for="item in lineNumbers" :key="item">{{ item }}</div>
      </div>
      <pre v-html="code"></pre>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { DownloadOutlined } from '@/components/icons';
  import { downloadText } from './gen-util';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github-dark.css';
  import java from 'highlight.js/lib/languages/java';
  import xml from 'highlight.js/lib/languages/xml';
  import sql from 'highlight.js/lib/languages/sql';

  hljs.registerLanguage('java', java);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('sql', sql);
  hljs.registerLanguage('vue', xml);

  const props = defineProps({
    /** 数据 */
    data: Object
  });

  /** 代码 */
  const code = ref('');

  /** 行号 */
  const lineNumbers = ref([]);

  /** 下载 */
  const handleDownload = () => {
    if (props.data && props.data.meta) {
      downloadText(props.data.meta.text, props.data.label);
    }
  };

  watch(
    () => props.data,
    (data) => {
      if (!data || !data.meta) {
        code.value = '';
        return;
      }
      const text = data.meta.text || '';
      code.value = hljs.highlight(text, { language: data.meta.language }).value;
      lineNumbers.value = text.split('\n').map((_, i) => i + 1);
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  .code-view {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    overflow: hidden;
  }

  .code-body {
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

  .code-line-numbers {
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

  .code-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #000;
    box-sizing: border-box;
  }

  .code-title {
    flex: 1;
    color: #e6edf3;
    padding: 0 12px;
    font-family: monospace;
    box-sizing: border-box;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
  }

  .code-tools {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 6px 10px 6px 0;

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

  .code-icon-tool {
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
</style>
