<!-- 表单构建器 -->
<template>
  <EleProFormBuilder
    v-bind="$props"
    :componentData="componentData || defaultComponentData"
    :templateData="templateData || defaultTemplateData"
    :configFormItems="configFormItems || defaultConfigFormItems"
    :configFormPresetProps="configFormPresetProps || formPresetProps"
    :proFormComponent="proFormComponent || ProForm"
    :codeEditerComponent="codeEditerComponent || CodeEditer"
    :jsonEditerComponent="jsonEditerComponent || JsonEditer"
    :htmlEditerComponent="htmlEditerComponent || HtmlEditer"
    :proFormInitialProps="{ footer: true }"
    @update:modelValue="handleUpdateModelValue"
    @previewFormSubmit="handlePreviewFormSubmit"
  >
    <template v-if="!$slots.headerTools" #headerTools>
      <ElButton
        :text="true"
        type="primary"
        :icon="CodeOutlined"
        @click="handlePreviewCode"
      >
        生成代码
      </ElButton>
      <CodePreview
        v-model="showCodePreview"
        :config="modelValue"
        :componentData="defaultComponentData"
      />
    </template>
    <template
      v-if="!$slots.proFormBuilderIconInput"
      #proFormBuilderIconInput="{ modelValue, updateValue }"
    >
      <IconEditer :modelValue="modelValue" @update:modelValue="updateValue" />
    </template>
    <template v-for="name in Object.keys($slots)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </EleProFormBuilder>
</template>

<script setup>
  import { ref } from 'vue';
  import { proFormBuilderProps } from 'ele-admin-plus/es/ele-pro-form-builder/props';
  import {
    defaultConfigFormItems,
    defaultConfigFormPresetProps as formPresetProps
  } from 'ele-admin-plus/es/ele-pro-form-builder/util';
  import { CodeOutlined } from '@/components/icons';
  import ProForm from '@/components/ProForm/index.vue';
  import { defaultComponentData } from './components/component-data';
  import { defaultTemplateData } from './components/template-data';
  import CodeEditer from './components/code-editer.vue';
  import JsonEditer from './components/json-editer.vue';
  import HtmlEditer from './components/html-editer.vue';
  import IconEditer from './components/icon-editer.vue';
  import CodePreview from './components/code-preview.vue';

  defineOptions({ name: 'ProFormBuilder' });

  defineProps(proFormBuilderProps);

  const emit = defineEmits(['update:modelValue']);

  /** 更新绑定值 */
  const handleUpdateModelValue = (config) => {
    emit('update:modelValue', config);
  };

  /** 预览表单提交事件 */
  const handlePreviewFormSubmit = (data) => {
    console.log(data);
  };

  /** 是否显示代码预览弹窗 */
  const showCodePreview = ref(false);

  /** 打开代码预览弹窗 */
  const handlePreviewCode = () => {
    showCodePreview.value = true;
  };
</script>
