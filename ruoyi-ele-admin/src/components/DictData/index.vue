<!-- 字典组件 -->
<template>
  <template v-if="type === 'text'">
    <span v-for="item in valueData" :key="item.dict_code">
      {{ item.dict_label }}
    </span>
  </template>
  <template v-else-if="type === 'tag'">
    <el-tag
      v-for="item in valueData"
      :key="item.dict_code"
      :disable-transitions="true"
      size="small"
      :type="item.list_class == 'primary' ? '' : item.list_class"
    >
      {{ item.dict_label }}
    </el-tag>
  </template>
  <el-radio-group
    v-else-if="type === 'radio'"
    :disabled="disabled"
    @update:modelValue="updateValue"
    :model-value="modelValue"
  >
    <el-radio v-for="item in data" :key="item.dict_code" :label="item.dict_value">
      {{ item.dict_label }}
    </el-radio>
  </el-radio-group>
  <el-checkbox-group
    v-else-if="type === 'checkbox'"
    :disabled="disabled"
    @update:modelValue="updateValue"
    :model-value="modelValue"
  >
    <el-checkbox
      v-for="item in data"
      :key="item.dict_code"
      :label="item.dict_value"
    >
      {{ item.dict_label }}
    </el-checkbox>
  </el-checkbox-group>
  <el-select
    v-else
    @update:modelValue="updateValue"
    :model-value="modelValue"
    :clearable="true"
    :disabled="disabled"
    :placeholder="placeholder"
    :multiple="type === 'multipleSelect'"
    class="ele-fluid"
  >
    <el-option
      v-for="item in data"
      :key="item.dict_code"
      :value="item.dict_value"
      :label="item.dict_label"
    />
  </el-select>
</template>

<script setup>
  import { computed } from 'vue';
  import { useDictData } from '@/utils/use-dict-data';

  const emit = defineEmits(['update:modelValue']);

  const props = defineProps({
    /** 字典值 */
    modelValue: [String, Number, Boolean, Array],
    /** 字典类型 */
    code: String,
    /** 组件类型 */
    type: String,
    /** 是否禁用 */
    disabled: Boolean,
    /** 提示文本 */
    placeholder: String,
    /** select的下拉是否插入到body下 */
    teleported: Boolean
  });

  /** 字典数据 */
  const [data] = useDictData([props.code]);

  /** 绑定值对应的字典数据 */
  const valueData = computed(() => {
    const result = [];
    const val = props.modelValue;
    if (val == null || val === '') {
      return result;
    }
    const values = Array.isArray(val) ? val : [val];
    values.forEach((v) => {
      const temp = data.value.find((d) => d.dict_value == v);
      if (temp != null) {
        result.push(temp);
      } else {
        result.push({ dict_code: v, dict_value: v, dict_label: v });
      }
    });
    return result;
  });

  /** 更新选中数据 */
  const updateValue = (value) => {
    emit('update:modelValue', value);
  };
</script>
