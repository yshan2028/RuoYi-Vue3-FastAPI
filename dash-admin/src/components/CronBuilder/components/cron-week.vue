<template>
  <div class="cron-panel-content">
    <ElRadioGroup v-model="type">
      <ElRadio value="every" label="每周，允许的通配符[, - * ? / L #]" />
      <ElRadio value="range" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>范围，</div>
          <div>从星期&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="start"
              :min="minValue"
              :max="maxValue - 1"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;到星期&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="end"
              :min="endMin"
              :max="maxValue"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
        </div>
      </ElRadio>
      <ElRadio value="interval" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>间隔，</div>
          <div>第&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="intervalStart"
              :min="minValue"
              :max="4"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;周的每星期&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="intervalStep"
              :min="minValue"
              :max="maxValue"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;执行一次</div>
        </div>
      </ElRadio>
      <ElRadio
        value="specified"
        :style="{
          height: 'auto',
          padding: '4px 0 0 0',
          alignItems: 'flex-start'
        }"
      >
        <div>指定</div>
        <div class="cron-panel-options">
          <ElCheckboxGroup v-model="selections">
            <template v-for="item in maxValue + 1" :key="item">
              <ElCheckbox
                v-if="item - 1 >= minValue"
                :value="item - 1"
                :label="weekNames[item - 1 - 1]"
                :style="{ width: '98px' }"
              />
            </template>
          </ElCheckboxGroup>
        </div>
      </ElRadio>
      <ElRadio value="last" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>每月最后一个星期&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="lastWeek"
              :min="minValue"
              :max="maxValue"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
        </div>
      </ElRadio>
      <ElRadio value="unset" label="不指定" />
    </ElRadioGroup>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { useCron } from './util';
  const minValue = 1;
  const maxValue = 7;
  const weekNames = [
    '1 星期日',
    '2 星期一',
    '3 星期二',
    '4 星期三',
    '5 星期四',
    '6 星期五',
    '7 星期六'
  ];

  /** week */
  const model = defineModel({ type: String });

  const {
    type,
    start,
    end,
    endMin,
    intervalStart,
    intervalStep,
    selections,
    getValue,
    parseValue
  } = useCron(minValue, maxValue, 'unset');

  /** 最后一个星期几 */
  const lastWeek = ref(1);

  watch(
    [type, start, end, intervalStart, intervalStep, selections],
    () => {
      if (type.value === 'last') {
        model.value = `${lastWeek.value}L`;
        return;
      }
      if (type.value === 'unset') {
        model.value = '?';
        return;
      }
      model.value = getValue();
    },
    { deep: true, immediate: true }
  );

  watch(
    model,
    (week) => {
      if (week != null && week.endsWith('L')) {
        type.value = 'last';
        lastWeek.value = Number(week.slice(0, -1));
        return;
      }
      if (week === '?') {
        type.value = 'unset';
        return;
      }
      parseValue(week);
    },
    { immediate: true }
  );
</script>
