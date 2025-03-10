<!-- 用户编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="640"
    v-model="visible"
    :title="isUpdate ? '修改用户' : '新建用户'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    >
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input
              clearable
              :maxlength="30"
              v-model="form.nickName"
              placeholder="请输入用户名"
              autocomplete="off"
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
          <el-form-item v-if="!isUpdate" label="用户名称" prop="userName">
            <el-input
              clearable
              :maxlength="30"
              v-model="form.userName"
              placeholder="请输入用户名称"
            />
          </el-form-item>
          <el-form-item label="用户性别" prop="sex">
            <dict-data
              code="sys_user_sex"
              v-model="form.sex"
              placeholder="请选择用户性别"
            />
          </el-form-item>
          <el-form-item label="岗位" prop="postIds">
            <post-select v-model="form.postIds" />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="归属部门">
            <dept-select v-model="form.deptId" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              clearable
              :maxlength="50"
              v-model="form.email"
              placeholder="请输入邮箱"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item v-if="!isUpdate" label="用户密码" prop="password">
            <el-input
              show-password
              type="password"
              :maxlength="20"
              v-model="form.password"
              placeholder="请输入用户密码"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <dict-data
              code="sys_normal_disable"
              type="radio"
              v-model="form.status"
            />
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <role-select v-model="form.roleIds" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.remark"
          placeholder="请输入内容"
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
  import { EleMessage, emailReg, phoneReg } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import RoleSelect from './role-select.vue';
  import PostSelect from './post-select.vue';
  import DeptSelect from '../../dept/components/dept-select.vue';
  import { addUser, updateUser, getUser } from '@/api/system/user';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object,
    /** 部门id */
    deptId: Number
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
    userId: void 0,
    deptId: void 0,
    nickName: '',
    phonenumber: '',
    userName: '',
    sex: void 0,
    email: '',
    password: '',
    status: '0',
    roleIds: [],
    postIds: [],
    remark: ''
  });

  /** 表单验证规则 */
  const rules = reactive({
    nickName: [
      {
        required: true,
        message: '请输入用户名',
        type: 'string',
        trigger: 'blur'
      }
    ],
    phonenumber: [
      {
        pattern: phoneReg,
        message: '手机号格式不正确',
        type: 'string',
        trigger: 'blur'
      }
    ],
    userName: [
      {
        required: true,
        message: '请输入用户名称',
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
    ],
    email: [
      {
        pattern: emailReg,
        message: '邮箱格式不正确',
        type: 'string',
        trigger: 'blur'
      }
    ],
    password: [
      {
        required: true,
        message: '请输入用户密码',
        type: 'string',
        trigger: 'blur'
      },
      {
        type: 'string',
        trigger: 'blur',
        pattern: /^[\S]{5,18}$/,
        message: '密码必须为5-18位非空白字符'
      }
    ],
    roleIds: [
      {
        required: true,
        message: '请选择角色',
        type: 'array',
        trigger: 'change'
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
      const saveOrUpdate = isUpdate.value ? updateUser : addUser;
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
      assignFields({ ...props.data, password: '' });
      getUser(props.data.userId)
        .then((data) => {
          assignFields({
            ...props.data,
            roleIds: data.roleIds,
            postIds: data.postIds,
            password: ''
          });
        })
        .catch((e) => {
          EleMessage.error(e.message);
        });
      isUpdate.value = true;
    } else {
      resetFields();
      form.deptId = props.deptId;
      isUpdate.value = false;
    }
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };
</script>
