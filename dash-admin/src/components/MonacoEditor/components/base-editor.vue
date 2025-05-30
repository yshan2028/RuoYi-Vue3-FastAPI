<template>
  <div ref="editorRef"></div>
</template>

<script setup>
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

  const props = defineProps({
    /** v-model */
    modelValue: String,
    /** 语言 */
    language: String,
    /** 主题 */
    theme: String,
    /** 配置 */
    config: Object
  });

  const emit = defineEmits(['update:modelValue']);

  /** 编辑器实例 */
  let editorIns = null;

  /** 编辑器节点 */
  const editorRef = ref(null);

  /** 更新modelValue */
  const updateModelValue = (value) => {
    emit('update:modelValue', value);
  };

  /** 渲染编辑器 */
  const render = () => {
    if (!editorRef.value) {
      return;
    }
    editorIns = monaco.editor.create(editorRef.value, {
      value: props.modelValue || '',
      language: props.language,
      theme: props.theme,
      automaticLayout: true,
      ...(props.config || {})
    });
    // modelValue属性同步编辑器内容
    editorIns.onDidChangeModelContent(() => {
      updateModelValue(editorIns?.getValue?.());
    });
  };

  /** 销毁编辑器 */
  const destory = () => {
    if (editorIns != null) {
      editorIns.dispose();
      editorIns = null;
    }
  };

  /** 修改内容 */
  const setContent = (value) => {
    if (editorIns && value !== editorIns.getValue()) {
      editorIns.setValue(value);
    }
  };

  /** 获取编辑器实例 */
  const getEditorIns = () => {
    return editorIns;
  };

  /** 编辑器内容同步modelValue属性 */
  watch(
    () => props.modelValue,
    (value) => {
      setContent(value || '');
    }
  );

  /** 更新代码语言和编辑器配置 */
  watch(
    [() => props.language, () => props.config],
    () => {
      destory();
      nextTick(() => {
        render();
      });
    },
    { deep: true }
  );

  /** 更新编辑器主题 */
  watch(
    () => props.theme,
    (theme) => {
      editorIns && editorIns.updateOptions({ theme });
    }
  );

  onMounted(() => {
    render();
  });

  onBeforeUnmount(() => {
    destory();
  });

  defineExpose({ getEditorIns });
</script>
