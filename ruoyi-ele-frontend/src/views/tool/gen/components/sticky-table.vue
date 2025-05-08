<!-- 编辑表格粘性表头 -->
<template>
  <div :class="['sticky-table', { 'is-ping-left': isPingLeft }]">
    <div
      ref="headerRef"
      style="position: sticky; top: 0; z-index: 999; overflow: hidden"
    >
      <ele-table :class="tableClass" :style="tableStyle">
        <colgroup>
          <slot name="colgroup"></slot>
        </colgroup>
        <thead>
          <slot name="thead"></slot>
        </thead>
      </ele-table>
    </div>
    <div style="overflow-x: auto" @scroll="handleScroll">
      <ele-table :class="tableClass" :style="tableStyle">
        <colgroup>
          <slot name="colgroup"></slot>
        </colgroup>
        <tbody>
          <slot name="tbody"></slot>
        </tbody>
      </ele-table>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  defineProps({
    /** 自定义表格样式 */
    tableStyle: Object,
    /** 自定义表格类名 */
    tableClass: String
  });

  /** 表头 */
  const headerRef = ref(null);

  /** 左侧固定列是否固定状态 */
  const isPingLeft = ref(false);

  /** 滚动事件, 同步滚动表头 */
  const handleScroll = (e) => {
    const el = headerRef.value;
    const scrollLeft = e.currentTarget.scrollLeft;
    if (el.scrollLeft != scrollLeft) {
      el.scrollLeft = scrollLeft;
    }
    isPingLeft.value = scrollLeft > 1;
  };
</script>

<style lang="scss" scoped>
  .sticky-table.is-ping-left :deep(.form-table-index) {
    &::before {
      content: '';
      width: 10px;
      position: absolute;
      top: 0;
      bottom: -1px;
      right: -10px;
      box-shadow: var(--ele-table-fixed-left-shadow);
      transition: box-shadow 0.2s;
      pointer-events: none;
    }

    &::after {
      display: none;
    }
  }
</style>
