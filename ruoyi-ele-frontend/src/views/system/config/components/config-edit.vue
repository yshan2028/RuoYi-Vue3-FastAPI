<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="460"
    v-model="visible"
    :title="isUpdate ? '修改参数' : '添加参数'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    >
      <el-form-item label="参数名称" prop="configName">
        <el-input
          clearable
          v-model="form.configName"
          placeholder="请输入参数名称"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input
          clearable
          v-model="form.configKey"
          placeholder="请输入参数键名"
        />
      </el-form-item>
      <el-form-item label="参数键值" prop="configValue">
        <el-input
          clearable
          v-model="form.configValue"
          placeholder="请输入参数键值"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <dict-data code="sys_yes_no" type="radio" v-model="form.configType" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          :rows="4"
          type="textarea"
          v-model="form.remark"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import { addConfig, updateConfig } from '@/api/system/config';

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
    configId: void 0,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'Y',
    remark: ''
  });

  /** 表单验证规则 */
  const rules = reactive({
    configName: [
      {
        required: true,
        message: '请输入参数名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    configKey: [
      {
        required: true,
        message: '请输入参数键名',
        type: 'string',
        trigger: 'blur'
      }
    ],
    configValue: [
      {
        required: true,
        message: '请输入参数键值',
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
      const saveOrUpdate = isUpdate.value ? updateConfig : addConfig;
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
