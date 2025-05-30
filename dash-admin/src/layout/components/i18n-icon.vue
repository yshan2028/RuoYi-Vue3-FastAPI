<!-- 国际化语言切换 -->
<template>
  <ele-dropdown
    :items="items"
    :model-value="locale"
    :placement="placement"
    :menu-style="{ minWidth: '108px' }"
    :popper-options="{
      modifiers: [{ name: 'offset', options: { offset: [0, 5] } }]
    }"
    :icon-props="{
      size: 12,
      style: { fontStyle: 'normal', fontWeight: '600' }
    }"
    style="line-height: inherit"
    @command="changeLanguage"
  >
    <div
      :style="{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        outline: 'none'
      }"
    >
      <slot>
        <el-icon>
          <GlobalOutlined :style="iconStyle" />
        </el-icon>
      </slot>
    </div>
  </ele-dropdown>
</template>

<script setup>
  import { ref, markRaw, h } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { GlobalOutlined } from '@/components/icons';
  import { setCacheLang } from '@/i18n/use-locale';

  defineProps({
    /** placement */
    placement: {
      type: String,
      default: 'bottom'
    },
    /** 自定义样式 */
    iconStyle: Object
  });

  const { locale } = useI18n();

  const items = ref([
    { title: '简体中文', command: 'zh_CN', icon: markRaw(h('span', {}, 'CN')) },
    { title: '繁體中文', command: 'zh_TW', icon: markRaw(h('span', {}, 'HK')) },
    { title: 'English', command: 'en', icon: markRaw(h('span', {}, 'US')) }
  ]);

  /** 切换语言 */
  const changeLanguage = (command) => {
    locale.value = command;
    setCacheLang(command);
  };
</script>
