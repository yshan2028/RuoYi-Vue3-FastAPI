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
    :props="regionCascaderProps"
    popper-class="ele-popper-higher"
    :collapse-tags="collapseTags"
    :max-collapse-tags="maxCollapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :showAllLevels="showAllLevels"
    :separator="separator"
    :teleported="teleported"
    class="ele-fluid"
  />
</template>

<script setup>
  import { ref, computed, reactive, watch } from 'vue';
  import { useRegionsData, filterData, getValueLabel } from './util';

  defineOptions({ name: 'RegionsSelect' });

  const props = defineProps({
    /** 自定义省市区数据 */
    options: Array,
    /** 选中值对应的字段名 */
    valueField: String,
    /** 类型, 省市选择或省选择 */
    type: String,
    /** 是否多选 */
    multiple: Boolean,
    /** 组件类型 */
    component: String,
    /** 提示文本 */
    placeholder: String,
    /** 是否禁用 */
    disabled: Boolean,
    /** 是否可清除 */
    clearable: {
      type: Boolean,
      default: true
    },
    /** 是否可搜索 */
    filterable: {
      type: Boolean,
      default: true
    },
    /** 级联面板属性 */
    cascaderProps: Object,
    /** 多选是否折叠标签 */
    collapseTags: {
      type: Boolean,
      default: true
    },
    /** 多选最大显示标签数量 */
    maxCollapseTags: {
      type: Number,
      default: 5
    },
    /** 多选标签折叠时是否显示提示 */
    collapseTagsTooltip: Boolean,
    /** 显示所有选中路径 */
    showAllLevels: {
      type: Boolean,
      default: true
    },
    /** 路径分隔符 */
    separator: String,
    /** 下拉框是否插入body */
    teleported: Boolean,
    /** 尺寸 */
    size: String
  });

  /** 选中值 */
  const model = defineModel({ type: Array });

  /** 省市区数据 */
  const regionsData = useRegionsData();

  /** 级联选择器实例 */
  const cascaderRef = ref(null);

  /** 级联选择器级联面板属性 */
  const regionCascaderProps = reactive({
    ...(props.cascaderProps || {}),
    multiple: props.multiple || !!props.cascaderProps?.multiple
  });

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

  /** 同步级联选择器级联面板属性 */
  watch(
    () => props.cascaderProps,
    (cascaderProps) => {
      const cProps = cascaderProps || {};
      [
        'expandTrigger',
        'checkStrictly',
        'emitPath',
        'lazy',
        'lazyLoad',
        'value',
        'label',
        'children',
        'disabled',
        'leaf',
        'hoverThreshold'
      ].forEach((k) => {
        if (regionCascaderProps[k] == null && cProps[k] == null) {
          return;
        }
        if (regionCascaderProps[k] !== cProps[k]) {
          regionCascaderProps[k] = cProps[k];
        }
      });
      if (props.multiple) {
        if (!regionCascaderProps.multiple) {
          regionCascaderProps.multiple = true;
        }
      } else if (!!regionCascaderProps.multiple !== !!cProps.multiple) {
        regionCascaderProps.multiple = cProps.multiple;
      }
    },
    {
      immediate: true,
      deep: true
    }
  );

  defineExpose({
    cascaderRef,
    getCheckedNodes: (leafOnly) => {
      return cascaderRef.value?.getCheckedNodes?.(!!leafOnly);
    }
  });
</script>
