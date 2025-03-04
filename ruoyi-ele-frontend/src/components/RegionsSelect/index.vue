<!-- 省市区级联选择 -->
<template>
  <template v-if="component === 'text'">
    <span v-if="typeof valueLabels === 'string'">{{ valueLabels }}</span>
    <el-space v-else :wrap="true">
      <el-tag
        v-for="label in valueLabels"
        :key="label"
        :disable-transitions="true"
        size="small"
        type="info"
      >
        {{ label }}
      </el-tag>
    </el-space>
  </template>
  <el-cascader
    v-else
    ref="cascaderRef"
    :size="size"
    :disabled="disabled"
    :clearable="clearable"
    v-model="model"
    :options="cascaderData"
    :filterable="filterable"
    :placeholder="placeholder"
    :props="cascaderProps"
    popper-class="ele-popper-higher"
    :collapse-tags="collapseTags"
    :max-collapse-tags="maxCollapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :teleported="teleported"
    class="ele-fluid"
  />
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRegionsData, filterData, getValueLabel } from './util';

  defineOptions({ name: 'RegionsSelect' });

  const props = defineProps({
    /** 自定义省市区数据 */
    options: Array,
    /** 选中值对应的字段名 */
    valueField: String,
    /** 类型, 省市选择或省选择 */
    type: String,
    /** 组件类型 */
    component: String,
    /** 级联选择器属性 */
    placeholder: String,
    disabled: Boolean,
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    cascaderProps: Object,
    collapseTags: {
      type: Boolean,
      default: true
    },
    maxCollapseTags: {
      type: Number,
      default: 5
    },
    collapseTagsTooltip: Boolean,
    teleported: Boolean,
    size: String
  });

  /** 选中值 */
  const model = defineModel({ type: Array });

  /** 省市区数据 */
  const regionsData = useRegionsData();

  /** 级联选择器实例 */
  const cascaderRef = ref(null);

  /** 级联选择器数据 */
  const cascaderData = computed(() => {
    const data = props.options ?? regionsData.value ?? [];
    return filterData(data, props.type, props.valueField);
  });

  /** 选中值对应的文本 */
  const valueLabels = computed(() => {
    const separator = ' / ';
    const values = model.value;
    if (values && values.length && Array.isArray(values[0])) {
      const result = [];
      values.forEach((v) => {
        const labels = getValueLabel(v, cascaderData.value);
        result.push(labels.join(separator));
      });
      return result;
    }
    const labels = getValueLabel(values, cascaderData.value);
    return labels.join(separator);
  });

  defineExpose({
    cascaderRef,
    getCheckedNodes: (leafOnly) => {
      return cascaderRef.value?.getCheckedNodes?.(!!leafOnly);
    }
  });
</script>
