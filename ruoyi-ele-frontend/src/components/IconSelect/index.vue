<!-- 图标选择器 -->
<template>
  <EleIconSelect
    v-bind="$props"
    :data="iconData"
    @update:modelValue="emitMethods['update:modelValue']"
    @change="emitMethods['change']"
    @visibleChange="emitMethods['visibleChange']"
    @clear="emitMethods['clear']"
    @focus="emitMethods['focus']"
    @blur="emitMethods['blur']"
  >
    <template #icon="{ icon }">
      <ElIcon>
        <component :is="icon" />
      </ElIcon>
    </template>
  </EleIconSelect>
</template>

<script setup>
  import {
    iconSelectProps,
    iconSelectEmits
  } from 'ele-admin-plus/es/ele-icon-select/props';
  import { useComponentEvents } from 'ele-admin-plus/es/utils/hook';
  import { getIconSelectData } from './util';

  defineOptions({ name: 'IconSelect' });

  defineProps(iconSelectProps);

  const emit = defineEmits(iconSelectEmits);

  const { emitMethods } = useComponentEvents(iconSelectEmits, emit);

  /** 图标数据 */
  const iconData = getIconSelectData();
</script>
