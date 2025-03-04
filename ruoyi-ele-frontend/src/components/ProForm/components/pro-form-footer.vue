<template>
  <ElFormItem v-bind="footerProps || {}">
    <template
      v-for="name in Object.keys(footerSlots || {}).filter(
        (k) =>
          k !== 'footer' &&
          !!(footerSlots && footerSlots[k] && $slots[footerSlots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="footerSlots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
    <div
      :style="{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        ...(footerStyle || {})
      }"
    >
      <slot name="footer">
        <ElButton
          type="primary"
          v-bind="submitButtonProps || {}"
          @click="submit"
        >
          {{ submitText }}
        </ElButton>
        <ElButton v-bind="resetButtonProps || {}" @click="reset">
          {{ resetText }}
        </ElButton>
      </slot>
      <ElLink
        v-if="showSearchExpand"
        type="primary"
        :underline="false"
        style="margin-left: 12px"
        v-bind="searchExpandButtonProps || {}"
        @click="toggleSearchExpand"
      >
        <template v-if="searchExpand">
          <span>{{ searchShrinkText }}</span>
          <ElIcon style="vertical-align: -1px">
            <ArrowUp />
          </ElIcon>
        </template>
        <template v-else>
          <span>{{ searchExpandText }}</span>
          <ElIcon style="vertical-align: -2px">
            <ArrowDown />
          </ElIcon>
        </template>
      </ElLink>
      <slot name="footerExtra"></slot>
    </div>
  </ElFormItem>
</template>

<script setup>
  import { ArrowDown, ArrowUp } from '@/components/icons';

  const props = defineProps({
    /** 底栏ElFormItem属性 */
    footerProps: Object,
    /** 底栏ElFormItem插槽 */
    footerSlots: Object,
    /** 底栏样式 */
    footerStyle: Object,
    /** 提交按钮文本 */
    submitText: String,
    /** 重置按钮文本 */
    resetText: String,
    /** 提交按钮属性 */
    submitButtonProps: Object,
    /** 重置按钮属性 */
    resetButtonProps: Object,
    /** 是否在底栏显示表单展开收起按钮 */
    showSearchExpand: Boolean,
    /** 搜索表单展开状态 */
    searchExpand: Boolean,
    /** 展开和收起按钮属性 */
    searchExpandButtonProps: Object,
    /** 展开按钮的文字 */
    searchExpandText: String,
    /** 收起按钮的文字 */
    searchShrinkText: String
  });

  const emit = defineEmits(['submit', 'reset', 'updateSearchExpand']);

  /** 提交 */
  const submit = () => {
    emit('submit');
  };

  /** 重置 */
  const reset = () => {
    emit('reset');
  };

  /** 切换搜索表单展开状态 */
  const toggleSearchExpand = () => {
    emit('updateSearchExpand', !props.searchExpand);
  };
</script>
