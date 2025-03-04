<!-- 高级表单 -->
<template>
  <ElForm
    ref="formRef"
    :model="model"
    :labelPosition="labelPosition"
    :labelWidth="labelWidth"
    :statusIcon="statusIcon"
    :validateOnRuleChange="validateOnRuleChange"
    :size="size"
    :disabled="disabled"
    :scrollToError="scrollToError"
    @submit.prevent=""
  >
    <slot name="topExtra"></slot>
    <ProFormContent
      :model="model"
      :rules="rules"
      :items="items"
      :grid="grid"
      :rowProps="rowProps"
      :contentExtraColProps="footerColProps"
      :searchExpand="searchExpand"
      @updateItemValue="updateValue"
    >
      <template
        v-for="name in Object.keys($slots).filter(
          (k) => !slotExcludes.includes(k)
        )"
        #[name]="slotProps"
      >
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
      <template v-if="footer" #contentExtra>
        <ProFormFooter
          :footerProps="footerProps"
          :footerSlots="footerSlots"
          :footerStyle="footerStyle"
          :submitText="submitText"
          :resetText="resetText"
          :submitButtonProps="submitButtonProps"
          :resetButtonProps="resetButtonProps"
          :showSearchExpand="showSearchExpand"
          :searchExpand="searchExpand"
          :searchExpandButtonProps="searchExpandButtonProps"
          :searchExpandText="searchExpandText"
          :searchShrinkText="searchShrinkText"
          @submit="submit"
          @reset="reset"
          @updateSearchExpand="updateSearchExpand"
        >
          <template
            v-for="name in Object.keys($slots).filter(
              (k) => !fSlotExcludes.includes(k)
            )"
            #[name]="slotProps"
          >
            <slot :name="name" v-bind="slotProps || {}"></slot>
          </template>
        </ProFormFooter>
      </template>
    </ProFormContent>
    <slot name="bottomExtra"></slot>
  </ElForm>
</template>

<script setup>
  import { ref, nextTick } from 'vue';
  import ProFormContent from './components/pro-form-content.vue';
  import ProFormFooter from './components/pro-form-footer.vue';
  const fSlotExcludes = ['default', 'topExtra', 'bottomExtra', 'contentExtra'];
  const slotExcludes = [...fSlotExcludes, 'footer', 'footerExtra'];

  defineOptions({ name: 'ProForm' });

  const props = defineProps({
    /** 表单数据 */
    model: {
      type: Object,
      required: true
    },
    /** 验证规则 */
    rules: Object,
    /** 表单域标签的位置 */
    labelPosition: String,
    /** 标签长度 */
    labelWidth: {
      type: [String, Number],
      default: '80px'
    },
    /** 是否显示校验结果图标 */
    statusIcon: Boolean,
    /** 是否在rules属性改变后立即触发一次验证 */
    validateOnRuleChange: Boolean,
    /** 尺寸 */
    size: String,
    /** 是否禁用 */
    disabled: Boolean,
    /** 当校验失败时滚动到第一个错误表单项 */
    scrollToError: Boolean,
    /** 表单项 */
    items: {
      type: Array,
      required: true
    },
    /** 是否栅格布局 */
    grid: [Boolean, Object],
    /** ElRow属性 */
    rowProps: Object,
    /** 是否需要底栏 */
    footer: Boolean,
    /** 底栏ElFormItem属性 */
    footerProps: Object,
    /** 底栏ElFormItem插槽 */
    footerSlots: Object,
    /** 底栏ElCol属性 */
    footerColProps: {
      type: Object,
      default: () => {
        return { span: 24 };
      }
    },
    /** 底栏样式 */
    footerStyle: Object,
    /** 提交按钮文本 */
    submitText: {
      type: String,
      default: '提交'
    },
    /** 重置按钮文本 */
    resetText: {
      type: String,
      default: '重置'
    },
    /** 提交按钮属性 */
    submitButtonProps: Object,
    /** 重置按钮属性 */
    resetButtonProps: Object,
    /** 是否在底栏显示表单展开收起按钮 */
    showSearchExpand: Boolean,
    /** 展开和收起按钮属性 */
    searchExpandButtonProps: Object,
    /** 展开按钮的文字 */
    searchExpandText: {
      type: String,
      default: '展开'
    },
    /** 收起按钮的文字 */
    searchShrinkText: {
      type: String,
      default: '收起'
    }
  });

  const emit = defineEmits(['updateValue', 'submit', 'reset']);

  /** 搜索表单展开状态 */
  const searchExpand = defineModel('searchExpand', { type: Boolean });

  /** 表单实例 */
  const formRef = ref(null);

  /** 更新值 */
  const updateValue = (prop, value) => {
    emit('updateValue', prop, value);
  };

  /** 更新搜索表单展开状态 */
  const updateSearchExpand = (expand) => {
    searchExpand.value = expand;
  };

  /** 提交 */
  const submit = () => {
    formRef.value?.validate?.((valid) => {
      if (valid) {
        emit('submit', props.model);
      }
    });
  };

  /** 重置 */
  const reset = () => {
    emit('reset');
    clearValidate();
    nextTick(() => {
      clearValidate();
      nextTick(() => {
        clearValidate();
      });
    });
  };

  /** 验证表单 */
  const validate = (callback) => {
    if (!formRef.value) {
      throw new Error('formRef is null');
    }
    return formRef.value.validate(callback);
  };

  /** 验证表单某个字段 */
  const validateField = (props, callback) => {
    if (!formRef.value) {
      throw new Error('formRef is null');
    }
    return formRef.value.validateField(props, callback);
  };

  /** 重置表单 */
  const resetFields = (props) => {
    if (!formRef.value) {
      throw new Error('formRef is null');
    }
    return formRef.value.resetFields(props);
  };

  /** 滚动到指定字段 */
  const scrollToField = (prop) => {
    if (!formRef.value) {
      throw new Error('formRef is null');
    }
    return formRef.value.scrollToField(prop);
  };

  /** 清理表单验证信息 */
  const clearValidate = (props) => {
    if (!formRef.value) {
      throw new Error('formRef is null');
    }
    return formRef.value.clearValidate(props);
  };

  defineExpose({
    formRef,
    validate,
    validateField,
    resetFields,
    scrollToField,
    clearValidate
  });
</script>
