<template>
  <ele-page flex-table hide-footer :multi-card="false">
    <ele-card flex-table :body-style="{ padding: 0, overflow: 'hidden' }">
      <pro-form-builder v-model="config" />
    </ele-card>
  </ele-page>
</template>

<script setup>
  import { ref } from 'vue';
  import ProFormBuilder from '@/components/ProFormBuilder/index.vue';

  defineOptions({ name: 'ToolBuild' });

  /** 表单配置数据 */
  const config = ref({});
</script>
