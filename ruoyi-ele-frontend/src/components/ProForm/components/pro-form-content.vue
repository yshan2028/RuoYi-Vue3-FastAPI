<template>
  <template v-if="!grid">
    <template v-for="item in items">
      <ProFormItem
        v-if="isShowItem(item, model, formItems || items, searchExpand)"
        :key="item.key ?? item.prop"
        :item="item"
        :model="model"
        :rules="rules"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template
          v-for="name in Object.keys($slots).filter(
            (k) => !slotExcludes.includes(k)
          )"
          #[name]="slotProps"
        >
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormItem>
    </template>
    <slot name="contentExtra"></slot>
  </template>
  <ElRow v-else v-bind="rowProps || {}">
    <template v-for="item in items">
      <ElCol
        v-if="isShowItem(item, model, formItems || items, searchExpand)"
        :key="item.key ?? item.prop"
        v-bind="{
          ...(grid === true ? { span: 12 } : grid),
          ...(item.colProps || {})
        }"
      >
        <ProFormItem
          :item="item"
          :model="model"
          :rules="rules"
          :formItems="formItems"
          :searchExpand="searchExpand"
          @updateItemValue="updateItemValue"
        >
          <template
            v-for="name in Object.keys($slots).filter(
              (k) => !slotExcludes.includes(k)
            )"
            #[name]="slotProps"
          >
            <slot :name="name" v-bind="slotProps || {}"></slot>
          </template>
        </ProFormItem>
      </ElCol>
    </template>
    <ElCol v-if="$slots.contentExtra" v-bind="contentExtraColProps || {}">
      <slot name="contentExtra"></slot>
    </ElCol>
  </ElRow>
</template>

<script setup>
  import ProFormItem from './pro-form-item.vue';
  import { isShowItem } from '../util';
  const slotExcludes = ['default', 'contentExtra'];

  defineProps({
    /** 表单数据 */
    model: {
      type: Object,
      required: true
    },
    /** 验证规则 */
    rules: Object,
    /** 表单项 */
    items: {
      type: Array,
      required: true
    },
    /** 是否栅格布局 */
    grid: [Boolean, Object],
    /** ElRow属性 */
    rowProps: Object,
    /** 额外的ElCol属性 */
    contentExtraColProps: Object,
    /** 全部的表单项 */
    formItems: Array,
    /** 搜索表单展开状态 */
    searchExpand: Boolean
  });

  const emit = defineEmits(['updateItemValue']);

  /** 更新值 */
  const updateItemValue = (prop, value) => {
    emit('updateItemValue', prop, value);
  };
</script>
