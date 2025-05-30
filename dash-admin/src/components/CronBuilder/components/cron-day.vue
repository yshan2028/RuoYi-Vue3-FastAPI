<template>
  <div class="cron-panel-content">
    <ElRadioGroup v-model="type">
      <ElRadio value="every" label="每日，允许的通配符[, - * ? / L W]" />
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
          <div>&emsp;号到&emsp;</div>
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
          <div>&emsp;号</div>
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
          <div>&emsp;号开始，每&emsp;</div>
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
          <div>&emsp;天执行一次</div>
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
      <ElRadio value="workday" :style="{ height: 'auto' }">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div>每月&emsp;</div>
          <div :style="{ width: '98px' }">
            <ElInputNumber
              v-model="workday"
              :min="minValue"
              :max="maxValue"
              placeholder=""
              controlsPosition="right"
              class="ele-fluid"
            />
          </div>
          <div>&emsp;号最近的一个工作日</div>
        </div>
      </ElRadio>
      <ElRadio value="last" label="本月最后一天" />
      <ElRadio value="unset" label="不指定" />
    </ElRadioGroup>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { useCron } from './util';
  const minValue = 1;
  const maxValue = 31;

  /** day */
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
  } = useCron(minValue, maxValue);

  /** 工作日 */
  const workday = ref(1);

  watch(
    [type, start, end, intervalStart, intervalStep, selections, workday],
    () => {
      if (type.value === 'workday') {
        model.value = `${workday.value}W`;
        return;
      }
      if (type.value === 'last') {
        model.value = 'L';
        return;
      }
      if (type.value === 'unset') {
        model.value = '?';
        return;
      }
      model.value = getValue();
    },
    {
      deep: true,
      immediate: true
    }
  );

  watch(
    model,
    (day) => {
      if (day != null && day.endsWith('W')) {
        type.value = 'workday';
        workday.value = Number(day.slice(0, -1));
        return;
      }
      if (day === 'L') {
        type.value = 'last';
        return;
      }
      if (day === '?') {
        type.value = 'unset';
        return;
      }
      parseValue(day);
    },
    { immediate: true }
  );
</script>
