<template>
  <div class="cron-panel">
    <div class="cron-panel-main">
      <EleTabs
        :addable="true"
        type="border-card"
        v-model="tabActive"
        :items="[
          { name: 'second', label: '秒' },
          { name: 'minute', label: '分钟' },
          { name: 'hour', label: '小时' },
          { name: 'day', label: '日' },
          { name: 'month', label: '月' },
          { name: 'week', label: '周' },
          { name: 'year', label: '年' }
        ]"
        @tab-add="openCronList"
      >
        <template #second>
          <CronSecond v-model="second" />
        </template>
        <template #minute>
          <CronMinute v-model="minute" />
        </template>
        <template #hour>
          <CronHour v-model="hour" />
        </template>
        <template #day>
          <CronDay v-model="day" />
        </template>
        <template #month>
          <CronMonth v-model="month" />
        </template>
        <template #week>
          <CronWeek v-model="week" />
        </template>
        <template #year>
          <CronYear v-model="year" />
        </template>
        <template #add-icon>
          <div>常用</div>
        </template>
      </EleTabs>
    </div>
    <div class="cron-panel-extra">
      <div class="cron-panel-extra-item">
        <div class="cron-panel-extra-header">结果</div>
        <div class="cron-panel-extra-body">
          <div class="cron-panel-result">
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">秒</div>
              <div class="cron-panel-result-text">{{ second }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">分钟</div>
              <div class="cron-panel-result-text">{{ minute }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">小时</div>
              <div class="cron-panel-result-text">{{ hour }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">日</div>
              <div class="cron-panel-result-text">{{ day }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">月</div>
              <div class="cron-panel-result-text">{{ month }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">周</div>
              <div class="cron-panel-result-text">{{ week }}</div>
            </div>
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">年</div>
              <div class="cron-panel-result-text">{{ year }}</div>
            </div>
          </div>
          <div class="cron-panel-result">
            <div class="cron-panel-result-item">
              <div class="cron-panel-result-title">Cron 表达式</div>
              <div
                class="cron-panel-result-text"
                :style="{ minWidth: '270px' }"
              >
                {{ model }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cron-panel-extra-item">
        <div class="cron-panel-extra-header">最近 5 次运行时间</div>
        <div class="cron-panel-extra-body">
          <ul class="cron-panel-test">
            <li
              v-for="item in resultItems"
              :key="item"
              class="cron-panel-test-item"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 常用列表 -->
    <div
      :class="['cron-list-mask', { 'is-show': cronListVisible }]"
      @click="hideCronList"
    >
      <div class="cron-list-wrapper" @click.stop="">
        <div
          v-for="item in cronList"
          :key="item.cron"
          class="cron-list-item"
          @click="handleItemClick(item)"
        >
          <div class="cron-list-item-value">{{ item.cron }}</div>
          <div class="cron-list-item-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import CronSecond from './cron-second.vue';
  import CronMinute from './cron-minute.vue';
  import CronHour from './cron-hour.vue';
  import CronDay from './cron-day.vue';
  import CronMonth from './cron-month.vue';
  import CronWeek from './cron-week.vue';
  import CronYear from './cron-year.vue';
  import { getResultItems } from './util';

  /** cron */
  const model = defineModel({ type: String });

  /** 选项卡选中 */
  const tabActive = ref('second');

  /** 秒 */
  const second = ref('*');

  /** 分 */
  const minute = ref('*');

  /** 时 */
  const hour = ref('*');

  /** 日 */
  const day = ref('*');

  /** 月 */
  const month = ref('*');

  /** 星期 */
  const week = ref('?');

  /** 年 */
  const year = ref('');

  /** 最近 5 次运行时间 */
  const resultItems = ref([]);

  /** 更新计算 */
  const updateCron = () => {
    const values = [
      second.value,
      minute.value,
      hour.value,
      day.value,
      month.value,
      week.value
    ];
    if (year.value != null && year.value !== '') {
      values.push(year.value);
    }
    const cron = values.join(' ');
    model.value = cron;
    return cron;
  };

  /** 数据修正 */
  watch(hour, (h) => {
    if (h !== '*' && second.value === '*') {
      second.value = '0';
    }
    if (h !== '*' && minute.value === '*') {
      minute.value = '0';
    }
  });

  watch(day, (d) => {
    if (d !== '?' && week.value !== '?') {
      week.value = '?';
    }
  });

  watch(week, (w) => {
    if (w !== '?' && day.value !== '?') {
      day.value = '?';
    }
  });

  /** 拼接 cron 表达式 */
  watch(
    [second, minute, hour, day, month, week, year],
    () => {
      updateCron();
    },
    { immediate: true }
  );

  /** 同步数据 */
  watch(model, (cron) => {
    if (!cron) {
      tabActive.value = 'second';
      second.value = '*';
      minute.value = '*';
      hour.value = '*';
      day.value = '*';
      month.value = '*';
      week.value = '?';
      year.value = '';
      const str = updateCron();
      resultItems.value = getResultItems(str);
      return;
    }
    const [s, m, h, d, m2, w, y] = cron.split(' ');
    second.value = s;
    minute.value = m;
    hour.value = h;
    day.value = d;
    month.value = m2;
    week.value = w;
    year.value = y || '';
    resultItems.value = getResultItems(cron);
  });

  /** 是否显示常用列表 */
  const cronListVisible = ref(false);

  /** 常用列表数据 */
  const cronList = ref([
    { cron: '0 * * * * ?', label: '每分钟' },
    { cron: '0 0 * * * ?', label: '每小时' },
    { cron: '0 0/30 * * * ?', label: '每半个小时' },
    { cron: '0 0/30 8-9 * * ?', label: '8 点到 9 点每半个小时' },
    { cron: '0 0 0 * * ?', label: '每天 0 点' },
    { cron: '0 30 8 * * ?', label: '每天 8:30' },
    { cron: '0 0 8,14,19 * * ?', label: '每天 8 点 14 点 19 点' },
    { cron: '0 0 0 1 * ?', label: '每月 1 号 0 点' },
    { cron: '0 0 2 1 * ?', label: '每月 1 号 2 点' },
    { cron: '0 30 8 15 * ?', label: '每月 15 号 8:30' },
    { cron: '0 0 0 L * ?', label: '每月最后一天 0 点' },
    { cron: '0 30 8 L * ?', label: '每月最后一天 8:30' },
    { cron: '0 30 8 ? * 6L', label: '每月最后一个星期五 8:30' },
    { cron: '0 0 0 ? * 1', label: '每周星期日 0 点' },
    { cron: '0 0 8 ? * 2-4', label: '每周星期一到星期三 8 点' },
    { cron: '0 0 0 1 10 ? 2025-2028', label: '2025 年至 2028 年每 10 月 1 号' }
  ]);

  /** 打开常用列表 */
  const openCronList = () => {
    cronListVisible.value = true;
  };

  /** 关闭常用列表 */
  const hideCronList = () => {
    cronListVisible.value = false;
  };

  /** 常用选择 */
  const handleItemClick = (item) => {
    model.value = item.cron;
    hideCronList();
  };

  defineExpose({ hideCronList });
</script>

<style scoped lang="scss">
  .cron-panel {
    position: relative;

    :deep(.ele-tabs) {
      --ele-tab-height: 32px;

      .el-tabs__content {
        padding: 0;
      }

      .el-tabs__new-tab {
        flex-shrink: 0;
        width: 36px;
        margin: 0 6px 0 0;
      }
    }
  }

  /* 内容 */
  .cron-panel :deep(.cron-panel-content) {
    height: 360px;
    padding: 12px 20px 0 20px;
    overflow: auto;
    box-sizing: border-box;

    > .el-radio-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: min-content;
      min-width: 100%;

      & > .el-radio {
        margin: 0;

        & + .el-radio {
          margin-top: 8px;
        }
      }
    }

    .cron-panel-options {
      padding: 6px 0 0 2px;
      white-space: normal;

      .el-checkbox {
        margin: 0;
        width: 66px;
        height: 26px;
      }
    }
  }

  /* 底栏 */
  .cron-panel-extra {
    border: 1px solid var(--el-border-color-light);
    border-top: none;
    display: flex;
  }

  .cron-panel-extra-item {
    flex-shrink: 0;
    box-sizing: border-box;

    &:first-child {
      flex: 1;
      overflow: hidden;
    }

    & + .cron-panel-extra-item {
      min-width: 220px;
      border-left: 1px solid var(--el-border-color-light);
    }
  }

  .cron-panel-extra-header {
    height: 28px;
    line-height: 28px;
    font-size: 13px;
    padding: 0 16px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-light);
    box-sizing: border-box;
    text-align: center;
  }

  .cron-panel-extra-body {
    padding: 6px 0;
    box-sizing: border-box;
    overflow: auto;
  }

  /* 结果 */
  .cron-panel-result {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    min-width: max-content;

    & + .cron-panel-result {
      margin: 12px 0 8px 0;
    }
  }

  .cron-panel-result-item {
    flex-shrink: 0;
  }

  .cron-panel-result-title {
    font-size: 12px;
    text-align: center;
    margin-bottom: 2px;
  }

  .cron-panel-result-text {
    font-size: 12px;
    text-align: center;
    min-width: 32px;
    max-width: 100%;
    height: 20px;
    line-height: 20px;
    padding: 0 4px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
    box-sizing: border-box;
  }

  /* 最近运行时间 */
  .cron-panel-test {
    padding: 0 0 0 8px;
    box-sizing: border-box;
    width: max-content;
    margin: 0 auto;
  }

  .cron-panel-test-item {
    line-height: 22px;

    &::marker {
      font-size: 16px;
      line-height: 16px;
    }
  }

  /* 常用列表 */
  .cron-list-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;

    &:not(.is-show) {
      pointer-events: none;

      .cron-list-wrapper {
        opacity: 0;
        transform: scale(0.6);
        pointer-events: none;
        visibility: hidden;
      }
    }
  }

  .cron-list-wrapper {
    width: max-content;
    max-height: calc(100% - 36px);
    margin: 36px 0 0 auto;
    padding: 8px;
    border-radius: 6px;
    background: var(--el-bg-color-overlay);
    box-shadow: var(--el-box-shadow-light);
    transition: all $transition-slow;
    transform-origin: top right;
    box-sizing: border-box;
    overflow: auto;
  }

  .cron-list-item {
    padding: 6px 8px 2px 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    transition: all 0.2s;
    cursor: pointer;

    & + .cron-list-item {
      margin-top: 8px;
    }

    &:hover {
      background: var(--el-fill-color-lighter);
    }
  }

  .cron-list-item-label {
    font-size: 12px;
    line-height: 18px;
    margin-top: 2px;
    opacity: 0.8;
  }

  .cron-list-item-value {
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    border-radius: 4px;
    padding: 0 6px;
    width: max-content;
    background: var(--el-color-info-light-9);
    border: 1px solid var(--el-border-color);
  }

  /* 小屏幕 */
  @media screen and (max-width: 768px) {
    .cron-panel :deep(.cron-panel-content) {
      height: 220px;
    }

    .cron-panel-extra {
      flex-direction: column;

      .cron-panel-extra-item {
        flex: none;

        & + .cron-panel-extra-item {
          border-top: 1px solid var(--el-border-color-light);
          border-left: none;
        }
      }
    }

    .cron-panel-result {
      gap: 2px;
    }
  }
</style>
