<template>
  <ele-tooltip
    placement="top-start"
    :popper-options="{
      strategy: 'fixed',
      modifiers: [{ name: 'offset', options: { offset: [-12, 10] } }]
    }"
    :content="tip"
  >
    <el-icon
      :size="15"
      style="align-self: center; margin-right: 4px; cursor: help"
    >
      <QuestionCircleOutlined style="opacity: 0.6" />
    </el-icon>
  </ele-tooltip>
  <span>{{ label }}</span>
</template>

<script setup>
  import { QuestionCircleOutlined } from '@/components/icons';

  defineProps({
    label: String,
    tip: String
  });
</script>
