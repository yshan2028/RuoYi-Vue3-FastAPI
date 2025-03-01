<template>
  <ele-dropdown
    :items="[
      { title: '编辑', command: 'edit', icon: EditPen },
      { title: '删除', command: 'remove', icon: Delete, danger: true }
    ]"
    placement="bottom-end"
    style="cursor: pointer"
    :popper-options="{
      modifiers: [{ name: 'offset', options: { offset: [12, 12] } }]
    }"
    @command="onCommand"
  >
    <ele-text
      type="placeholder"
      :icon="MoreOutlined"
      style="transform: scale(1.32); outline: none"
    />
  </ele-dropdown>
</template>

<script setup>
  import { EditPen, Delete } from '@element-plus/icons-vue';
  import { MoreOutlined } from '@/components/icons';

  const emit = defineEmits(['command']);

  const onCommand = (command) => {
    emit('command', command);
  };
</script>
