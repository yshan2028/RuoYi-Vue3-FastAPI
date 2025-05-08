<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="640"
    v-model="visible"
    :body-style="{ paddingLeft: '8px' }"
    :title="isUpdate ? '修改定时任务' : '添加定时任务'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent=""
    >
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="任务名称" prop="jobName">
            <el-input
              clearable
              v-model="form.jobName"
              placeholder="请输入任务名称"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="任务分组" prop="jobGroup">
            <dict-data
              code="sys_job_group"
              v-model="form.jobGroup"
              placeholder="请选择任务分组"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item prop="invokeTarget">
        <template #label>
          <ele-tooltip
            placement="top-start"
            :popper-options="{
              modifiers: [{ name: 'offset', options: { offset: [-12, 10] } }]
            }"
          >
            <el-icon
              :size="15"
              style="align-self: center; margin-right: 2px; cursor: help"
            >
              <QuestionCircleOutlined style="opacity: 0.6" />
            </el-icon>
            <template #content>
              <div>Bean调用示例: ryTask.ryParams('ry')</div>
              <div>
                Class类调用示例: com.ruoyi.quartz.task.RyTask.ryParams('ry')
              </div>
              <div>参数说明: 支持字符串，布尔类型，长整型，浮点型，整型</div>
            </template>
          </ele-tooltip>
          <span>调用方法</span>
        </template>
        <el-input
          clearable
          v-model="form.invokeTarget"
          placeholder="请输入调用目标字符串"
        />
      </el-form-item>
      <el-form-item label="cron表达式" prop="cronExpression">
        <el-input
          clearable
          v-model="form.cronExpression"
          placeholder="请输入cron执行表达式"
        >
          <template #append>
            <el-button class="ele-btn-icon" @click="openCron">
              <span>生成表达式</span>
              <el-icon style="margin: -1px -4px 0 4px">
                <ClockCircleOutlined />
              </el-icon>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="执行策略" prop="misfirePolicy">
        <el-radio-group v-model="form.misfirePolicy" class="policy-radio-group">
          <el-radio-button value="1" label="立即执行" />
          <el-radio-button value="2" label="执行一次" />
          <el-radio-button value="3" label="放弃执行" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否并发" prop="concurrent">
        <el-radio-group v-model="form.concurrent">
          <el-radio-button value="0" label="允许" />
          <el-radio-button value="1" label="禁止" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
        <dict-data code="sys_job_status" type="radio" v-model="form.status" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
  <!-- Cron 表达式生成器 -->
  <cron-builder
    :cron="form.cronExpression"
    v-model="cronBuilderVisible"
    @done="handleCronDone"
  />
</template>

<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    QuestionCircleOutlined,
    ClockCircleOutlined
  } from '@/components/icons';
  import { useFormData } from '@/utils/use-form-data';
  import CronBuilder from '@/components/CronBuilder/index.vue';
  import { addJob, updateJob } from '@/api/monitor/job';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    jobId: void 0,
    jobName: '',
    jobGroup: void 0,
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '1',
    concurrent: '0',
    status: '0'
  });

  /** 表单验证规则 */
  const rules = reactive({
    jobName: [
      {
        required: true,
        message: '请输入任务名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    invokeTarget: [
      {
        required: true,
        message: '请输入调用目标字符串',
        type: 'string',
        trigger: 'blur'
      }
    ],
    cronExpression: [
      {
        required: true,
        message: '请输入cron执行表达式',
        type: 'string',
        trigger: 'blur'
      }
    ]
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? updateJob : addJob;
      saveOrUpdate(form)
        .then((msg) => {
          loading.value = false;
          EleMessage.success(msg);
          handleCancel();
          emit('done');
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error(e.message);
        });
    });
  };

  /** 是否打开cron表达式生成 */
  const cronBuilderVisible = ref(false);

  /** 打开cron表达式生成 */
  const openCron = () => {
    cronBuilderVisible.value = true;
  };

  /** cron表达式生成完成事件 */
  const handleCronDone = (cron) => {
    form.cronExpression = cron;
    cronBuilderVisible.value = false;
    formRef.value?.clearValidate?.();
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    if (props.data) {
      assignFields(props.data);
      isUpdate.value = true;
    } else {
      resetFields();
      isUpdate.value = false;
    }
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };
</script>

<style lang="scss" scoped>
  @media screen and (max-width: 460px) {
    .policy-radio-group :deep(.el-radio-button__inner) {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
</style>
