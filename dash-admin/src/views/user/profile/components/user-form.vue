<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    style="max-width: 580px; padding: 34px 16px 12px 0; box-sizing: border-box"
    @submit.prevent=""
  >
    <el-form-item label="昵称" prop="nickName">
      <el-input
        clearable
        :maxlength="20"
        v-model="form.nickName"
        placeholder="请输入昵称"
      />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input
        clearable
        :maxlength="11"
        v-model="form.phonenumber"
        placeholder="请输入手机号码"
      />
    </el-form-item>
    <el-form-item label="性别" prop="sex">
      <el-select
        clearable
        v-model="form.sex"
        placeholder="请选择性别"
        class="ele-fluid"
      >
        <el-option value="1" label="男" />
        <el-option value="2" label="女" />
      </el-select>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input
        clearable
        :maxlength="100"
        v-model="form.email"
        placeholder="请输入邮箱"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="save">
        {{ loading ? '保存中..' : '保存更改' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import { updateUserProfile } from '@/api/profile';
  const props = defineProps({
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, _resetFields, assignFields] = useFormData({
    nickName: '',
    phonenumber: '',
    sex: void 0,
    userId: void 0,
    email: ''
  });

  /** 表单验证规则 */
  const rules = reactive({
    nickName: [
      {
        required: true,
        message: '请输入用户昵称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    phonenumber: [
      {
        required: true,
        message: '请输入手机号码',
        type: 'string',
        trigger: 'blur'
      }
    ],
    email: [
      {
        required: true,
        message: '请输入邮箱',
        type: 'string',
        trigger: 'blur'
      }
    ],
    sex: [
      {
        required: true,
        message: '请选择性别',
        type: 'string',
        trigger: 'change'
      }
    ]
  });

  /** 保存更改 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      updateUserProfile(form)
        .then(() => {
          loading.value = false;
          EleMessage.success('修改成功');
          emit('done', form);
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error(e.message);
        });
    });
  };

  // 回显当前登录用户信息
  assignFields({
    ...props.data
  });
</script>

<style lang="scss" scoped>
  .form-tell {
    display: flex;
    align-items: center;
    width: 100%;

    .form-tell-prefix {
      width: 65px;
    }

    .form-tell-body {
      flex: 1;
      padding-left: 12px;
      box-sizing: border-box;
    }
  }
</style>
