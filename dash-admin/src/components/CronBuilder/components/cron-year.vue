<template>
  <div class="cron-panel-content">
    <ElRadioGroup v-model="type">
      <ElRadio value="every" label="每年，允许的通配符[, - * /]" />
      <ElRadio value="range" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>范围，</div>
          <div>从&emsp;</div>
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
          <div>&emsp;年到&emsp;</div>
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
          <div>&emsp;年</div>
        </div>
      </ElRadio>
      <ElRadio value="interval" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>间隔，</div>
          <div>从&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="intervalStart"
              :min="minValue"
              :max="maxValue - 1"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;年开始，每&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="intervalStep"
              :min="1"
              :max="intervalStepMax"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;年执行一次</div>
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
                :label="item - 1"
              />
            </template>
          </ElCheckboxGroup>
        </div>
      </ElRadio>
      <ElRadio value="unset" label="不指定" />
    </ElRadioGroup>
  </div>
</template>

<script setup>
  import { watch } from 'vue';
  import { useCron } from './util';
  const minValue = 2024;
  const maxValue = 2054;

  /** year */
  const model = defineModel({ type: String });

  const {
    type,
    start,
    end,
    endMin,
    intervalStart,
    intervalStep,
    intervalStepMax,
    selections,
    getValue,
    parseValue
  } = useCron(minValue, maxValue, 'unset');

  watch(
    [type, start, end, intervalStart, intervalStep, selections],
    () => {
      if (type.value === 'unset') {
        model.value = '';
        return;
      }
      model.value = getValue();
    },
    { deep: true, immediate: true }
  );

  watch(
    model,
    (year) => {
      if (year == null || year === '' || year === '?') {
        type.value = 'unset';
        return;
      }
      parseValue(year);
    },
    { immediate: true }
  );
</script>
