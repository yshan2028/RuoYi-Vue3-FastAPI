<!-- 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="72px" @keyup.enter="search">
      <el-row :gutter="8">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="公告标题">
            <el-input
              clearable
              v-model.trim="form.notice_title"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="创建者">
            <el-input
              clearable
              v-model.trim="form.create_by"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="公告类型">
            <dict-data
              code="sys_notice_type"
              v-model="form.notice_type"
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
    notice_title: '',
    create_by: '',
    notice_type: void 0
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
