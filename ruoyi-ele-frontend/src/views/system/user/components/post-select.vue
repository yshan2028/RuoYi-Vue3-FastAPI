<!-- 岗位选择下拉框 -->
<template>
  <el-select
    multiple
    clearable
    v-model="model"
    :placeholder="placeholder"
    class="ele-fluid"
  >
    <el-option
      v-for="item in data"
      :key="item.postId"
      :value="item.postId"
      :label="item.postName"
    />
  </el-select>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { listPosts } from '@/api/system/post';

  defineProps({
    /** 提示信息 */
    placeholder: {
      type: String,
      default: '请选择岗位'
    }
  });

  /** 选中的岗位 */
  const model = defineModel({ type: Array });

  /** 岗位数据 */
  const data = ref([]);

  /** 获取角色数据 */
  listPosts()
    .then((list) => {
      data.value = list;
    })
    .catch((e) => {
      EleMessage.error(e.message);
    });
</script>
