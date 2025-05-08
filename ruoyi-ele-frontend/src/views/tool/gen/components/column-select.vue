<!-- 字段选择下拉框 -->
<template>
  <el-select
    clearable
    v-model="model"
    :placeholder="placeholder"
    class="ele-fluid"
    :popper-options="{ strategy: 'fixed' }"
  >
    <el-option
      v-for="item in data"
      :key="item.columnName"
      :value="item.columnName"
      :label="`${item.columnName}: ${item.columnComment}`"
    />
  </el-select>
</template>

<script setup>
  defineProps({
    /** 提示信息 */
    placeholder: {
      type: String,
      default: '请选择'
    },
    /** 下拉数据 */
    data: Array
  });

  /** 选中的数据 */
  const model = defineModel({ type: String });
</script>
