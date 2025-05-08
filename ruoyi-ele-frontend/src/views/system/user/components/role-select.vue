<!-- 角色选择下拉框 -->
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
      :key="item.roleId"
      :value="item.roleId"
      :label="item.roleName"
    />
  </el-select>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { listRoles } from '@/api/system/role';

  defineProps({
    /** 提示信息 */
    placeholder: {
      type: String,
      default: '请选择角色'
    }
  });

  /** 选中的角色 */
  const model = defineModel({ type: Array });

  /** 角色数据 */
  const data = ref([]);

  /** 获取角色数据 */
  listRoles()
    .then((list) => {
      data.value = list;
    })
    .catch((e) => {
      EleMessage.error(e.message);
    });
</script>
