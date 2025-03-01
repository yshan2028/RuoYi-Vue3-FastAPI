<!-- 路由出口 -->
<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in" appear>
      <keep-alive
        v-if="TAB_KEEP_ALIVE && tabBar"
        :include="keepAliveInclude"
        :max="10"
      >
        <component :is="Component" />
      </keep-alive>
      <component v-else :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { useThemeStore } from '@/store/modules/theme';
  import { TAB_KEEP_ALIVE } from '@/config/setting';

  const themeStore = useThemeStore();
  const { keepAliveInclude, transitionName, tabBar } = storeToRefs(themeStore);
</script>

<script>
  export default {
    name: 'RouterLayout'
  };
</script>
