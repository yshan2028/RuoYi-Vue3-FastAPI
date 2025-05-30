<!-- 图标编辑器 -->
<template>
  <IconSelect
    :clearable="true"
    :popperHeight="388"
    filterable="popper"
    placeholder="请选择图标"
    :popperOptions="{ strategy: 'fixed' }"
    :modelValue="modelValue"
    @update:modelValue="updateModelValue"
  />
</template>

<script setup>
  import IconSelect from '@/components/IconSelect/index.vue';

  defineProps({
    /** 图标 */
    modelValue: String
  });

  const emit = defineEmits(['update:modelValue']);

  /** 更新图标 */
  const updateModelValue = (value) => {
    emit('update:modelValue', value);
  };
</script>
