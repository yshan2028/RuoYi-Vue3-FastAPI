<!-- 高级表单 -->
<template>
  <EleProForm
    v-bind="$props"
    ref="proFormRef"
    :httpRequest="httpRequest"
    @update:searchExpand="emitMethods['update:searchExpand']"
    @updateValue="emitMethods['updateValue']"
    @update:items="emitMethods['update:items']"
    @update:activeItemKey="emitMethods['update:activeItemKey']"
    @submit="emitMethods['submit']"
    @reset="emitMethods['reset']"
    @validate="emitMethods['validate']"
  >
    <template
      v-for="name in Object.keys($slots).filter((k) => !ownSlots.includes(k))"
      #[name]="slotProps"
    >
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
    <template #dictRadio="{ item, modelValue, updateValue }">
      <DictData
        code=""
        v-bind="item.props || {}"
        type="radio"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #dictCheckbox="{ item, modelValue, updateValue }">
      <DictData
        code=""
        v-bind="item.props || {}"
        type="checkbox"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #dictSelect="{ item, modelValue, updateValue }">
      <DictData
        code=""
        :placeholder="'请选择' + item.label"
        v-bind="item.props || {}"
        type="select"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #dictMultipleSelect="{ item, modelValue, updateValue }">
      <DictData
        code=""
        :placeholder="'请选择' + item.label"
        v-bind="item.props || {}"
        type="multipleSelect"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template
      #imageUpload="{ item, modelValue, updateValue, itemComponentRef }"
    >
      <ImageUpload
        v-bind="item.props || {}"
        :ref="itemComponentRef"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #fileUpload="{ item, modelValue, updateValue, itemComponentRef }">
      <FileUpload
        v-bind="item.props || {}"
        :ref="itemComponentRef"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #regions="{ item, modelValue, updateValue }">
      <RegionsSelect
        :placeholder="'请选择' + item.label"
        v-bind="item.props || {}"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #multipleRegions="{ item, modelValue, updateValue }">
      <RegionsSelect
        :placeholder="'请选择' + item.label"
        v-bind="item.props || {}"
        :multiple="true"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #iconSelect="{ item, modelValue, updateValue }">
      <IconSelect
        :placeholder="'请选择' + item.label"
        v-bind="item.props || {}"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
    <template #editor="{ item, modelValue, updateValue }">
      <TinymceEditor
        v-bind="item.props || {}"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
  </EleProForm>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useComponentEvents } from 'ele-admin-plus/es/utils/hook';
  import {
    proFormProps,
    proFormEmits
  } from 'ele-admin-plus/es/ele-pro-form/props';
  import ImageUpload from '@/components/ImageUpload/index.vue';
  import FileUpload from '@/components/FileUpload/index.vue';
  import RegionsSelect from '@/components/RegionsSelect/index.vue';
  import IconSelect from '@/components/IconSelect/index.vue';
  import TinymceEditor from '@/components/TinymceEditor/index.vue';
  import httpRequest from '@/utils/request';
  const ownSlots = [
    'default',
    'dictRadio',
    'dictCheckbox',
    'dictSelect',
    'dictMultipleSelect',
    'imageUpload',
    'fileUpload',
    'regions',
    'multipleRegions',
    'iconSelect',
    'editor'
  ];

  defineOptions({ name: 'ProForm' });

  defineProps(proFormProps);

  const emit = defineEmits(proFormEmits);

  const { emitMethods } = useComponentEvents(proFormEmits, emit);

  /** 高级表单实例 */
  const proFormRef = ref(null);

  /** 表单实例 */
  const formRef = computed(() => proFormRef.value?.formRef);

  /** 实例方法 */
  const exposeMethods = {};
  [
    'validate',
    'validateField',
    'resetFields',
    'scrollToField',
    'clearValidate'
  ].forEach((key) => {
    exposeMethods[key] = (...params) => {
      if (!proFormRef.value) {
        throw new Error('proFormRef is null');
      }
      return proFormRef.value[key](...params);
    };
  });

  defineExpose({ ...exposeMethods, proFormRef, formRef });
</script>
