<!-- 搜索表单 -->
<template>
  <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
    <el-row :gutter="8">
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="用户名称">
          <el-input
            clearable
            v-model.trim="form.userName"
            placeholder="请输入"
          />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="手机号码">
          <el-input
            clearable
            v-model.trim="form.phonenumber"
            placeholder="请输入"
          />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="创建时间">
          <el-date-picker
            unlink-panels
            type="daterange"
            v-model="dateRange"
            range-separator="-"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="ele-fluid"
          />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label-width="16px">
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
  import { ref } from 'vue';
  import { useFormData } from '@/utils/use-form-data';

  const emit = defineEmits(['search']);

  /** 表单数据 */
  const [form, resetForm] = useFormData({
    userName: '',
    phonenumber: ''
  });

  /** 日期范围 */
  const dateRange = ref(['', '']);

  /** 重置表单数据 */
  const resetFields = () => {
    resetForm();
    dateRange.value = ['', ''];
  };

  /** 搜索 */
  const search = () => {
    const [d1, d2] = dateRange.value || [];
    emit('search', { ...form, params: { beginTime: d1, endTime: d2 } });
  };

  /** 重置 */
  const reset = () => {
    resetFields();
    search();
  };

  defineExpose({ resetFields });
</script>
