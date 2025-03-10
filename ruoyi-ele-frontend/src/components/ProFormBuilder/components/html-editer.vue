<!-- 富文本编辑器 -->
<template>
  <MonacoEditor
    theme="vs-dark"
    language="html"
    :modelValue="modelValue"
    @update:modelValue="updateModelValue"
    :config="editorConfig"
    :style="{ height: '100%' }"
  />
</template>

<script setup>
  import MonacoEditor from '@/components/MonacoEditor/index.vue';
  const editorConfig = {
    contextmenu: false,
    minimap: { enabled: false },
    suggest: { enabled: false },
    inlineSuggest: { enabled: false },
    quickSuggestions: false,
    parameterHints: { enabled: false },
    autoClosingBrackets: 'never',
    autoClosingQuotes: 'never',
    formatOnType: false,
    formatOnPaste: false,
    codeLens: false,
    lightbulb: { enabled: 'off' },
    snippetSuggestions: 'none',
    wordBasedSuggestions: 'off',
    selectionHighlight: false,
    occurrencesHighlight: 'off',
    matchBrackets: 'never'
  };

  defineProps({
    /** 代码 */
    modelValue: String
  });

  const emit = defineEmits(['update:modelValue']);

  /** 更新代码 */
  const updateModelValue = (value) => {
    emit('update:modelValue', value);
  };
</script>
