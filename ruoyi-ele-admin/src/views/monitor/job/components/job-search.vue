<!-- 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="72px" @keyup.enter="search">
      <el-row :gutter="8">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="任务名称">
            <el-input
              clearable
              v-model.trim="form.job_name"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="任务组名">
            <dict-data
              code="sys_job_group"
              v-model="form.job_group"
              placeholder="请选择"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="状态">
            <dict-data
              code="sys_job_status"
              v-model="form.status"
              placeholder="请选择"
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
  </ele-card>
</template>

<script setup>
  import { useFormData } from '@/utils/use-form-data';

  const emit = defineEmits(['search']);

  /** 表单数据 */
  const { form, resetFields } = useFormData({
    job_name: '',
    job_group: '',
    status: void 0
  });

  /** 搜索 */
  const search = () => {
    emit('search', form);
  };

  /** 重置 */
  const reset = () => {
    resetFields();
    search();
  };
</script>
