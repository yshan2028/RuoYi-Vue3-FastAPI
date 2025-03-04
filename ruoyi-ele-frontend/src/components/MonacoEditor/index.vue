<!-- 代码编辑器 -->
<template>
  <DiffEditor
    v-if="diff"
    ref="editorRef"
    v-model="model"
    :language="language"
    :theme="theme"
    v-model:original="original"
    :originalLanguage="originalLanguage"
    :config="config"
    style="height: 600px"
  />
  <BaseEditor
    v-else
    ref="editorRef"
    v-model="model"
    :language="language"
    :theme="theme"
    :config="config"
    style="height: 600px"
  />
</template>

<script setup>
  import { ref } from 'vue';
  import BaseEditor from './components/base-editor.vue';
  import DiffEditor from './components/diff-editor.vue';
  import './user-worker';

  defineOptions({ name: 'MonacoEditor' });

  defineProps({
    /** 语言 */
    language: {
      type: String,
      default: 'typescript'
    },
    /** 主题 */
    theme: String,
    /** 是否为diff模式 */
    diff: Boolean,
    /** 原始内容语言 */
    originalLanguage: String,
    /** 配置 */
    config: Object
  });

  /** v-model */
  const model = defineModel({ type: String });

  /** 原始内容 */
  const original = defineModel('original', { type: String });

  /** 组件实例 */
  const editorRef = ref(null);

  /** 获取编辑器实例 */
  const getEditorIns = () => {
    return editorRef.value?.getEditorIns?.();
  };

  defineExpose({ getEditorIns });
</script>
