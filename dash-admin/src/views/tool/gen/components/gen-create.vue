<!-- 编辑弹窗 -->
<template>
  <ele-modal
    :width="580"
    title="创建表"
    v-model="visible"
    :body-style="{ paddingTop: '6px' }"
    @open="handleOpen"
  >
    <div style="margin-bottom: 6px">创建表语句（支持多个建表语句）：</div>
    <el-input
      :rows="10"
      type="textarea"
      v-model="sql"
      placeholder="请输入创建表语句"
    />
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { createTable } from '@/api/tool/gen';

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 创建表语句 */
  const sql = ref('');

  /** 提交状态 */
  const loading = ref(false);

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    if (!sql.value) {
      EleMessage.error('请输入创建表语句');
      return;
    }
    loading.value = true;
    createTable(sql.value)
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
  };

  /** 弹窗打开事件 */
  const handleOpen = () => {
    sql.value = '';
  };
</script>
