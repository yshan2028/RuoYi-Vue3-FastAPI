<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="460"
    v-model="visible"
    :title="isUpdate ? '修改岗位' : '添加岗位'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    >
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          clearable
          v-model="form.postName"
          placeholder="请输入岗位名称"
        />
      </el-form-item>
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          clearable
          v-model="form.postCode"
          placeholder="请输入岗位编码"
        />
      </el-form-item>
      <el-form-item label="岗位排序" prop="postSort">
        <el-input-number
          :min="0"
          :max="99999"
          v-model="form.postSort"
          placeholder="请输入岗位排序"
          controls-position="right"
          class="ele-fluid"
        />
      </el-form-item>
      <el-form-item label="岗位状态" prop="status">
        <dict-data
          code="sys_normal_disable"
          type="radio"
          v-model="form.status"
        />
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
  import { addPost, updatePost } from '@/api/system/post';

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
    postId: void 0,
    postName: '',
    postCode: '',
    postSort: 0,
    status: '0',
    remark: ''
  });

  /** 表单验证规则 */
  const rules = reactive({
    postName: [
      {
        required: true,
        message: '请输入岗位名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    postCode: [
      {
        required: true,
        message: '请输入岗位编码',
        type: 'string',
        trigger: 'blur'
      }
    ],
    postSort: [
      {
        required: true,
        message: '请输入岗位排序',
        type: 'number',
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
      const saveOrUpdate = isUpdate.value ? updatePost : addPost;
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
