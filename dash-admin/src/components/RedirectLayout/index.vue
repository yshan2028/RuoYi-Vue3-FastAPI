<!-- 路由刷新页面 -->
<template>
  <div></div>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useThemeStore } from '@/store/modules/theme';

  defineOptions({ name: 'RedirectLayout' });

  const { replace } = useRouter();
  const { params, query } = useRoute();
  const themeStore = useThemeStore();
  const { tabs } = storeToRefs(themeStore);

  const from = Array.isArray(params.path) ? params.path.join('/') : params.path;

  setTimeout(() => {
    tabs.value.forEach((t) => {
      if (t.refresh) {
        themeStore.tabSetItem({ key: t.key, refresh: false });
      }
    });
    replace({ path: '/' + from, query });
  }, 100);
</script>
