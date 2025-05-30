<!-- 图标选择下拉框 -->
<template>
  <ele-icon-select
    clearable
    filterable="popper"
    :data="iconData"
    v-model="model"
    :placeholder="placeholder"
    :disabled="disabled"
    :popper-width="420"
    :popper-height="294"
    :grid-style="{ gridTemplateColumns: 'repeat(6, 1fr)' }"
    :item-style="{ height: '52px' }"
    :popper-options="{ strategy: 'fixed' }"
  >
    <template #icon="{ icon }">
      <el-icon>
        <component :is="icon" />
      </el-icon>
    </template>
  </ele-icon-select>
</template>

<script setup>
  import * as MenuIcons from '@/layout/menu-icons';

  defineOptions({ components: MenuIcons });

  defineProps({
    /** 是否禁用 */
    disabled: Boolean,
    /** 提示信息 */
    placeholder: {
      type: String,
      default: '请选择菜单图标'
    }
  });

  /** 选中的图标 */
  const model = defineModel({ type: String });

  const iconNames = Object.keys(MenuIcons);

  const iconData = [
    {
      title: '线框风格',
      icons: iconNames.filter((name) => !name.endsWith('Filled'))
    },
    {
      title: '实底风格',
      icons: iconNames.filter((name) => name.endsWith('Filled'))
    }
  ];
</script>
