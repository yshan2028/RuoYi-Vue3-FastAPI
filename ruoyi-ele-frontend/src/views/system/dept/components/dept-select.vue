<!-- 部门选择下拉框 -->
<template>
  <el-tree-select
    clearable
    check-strictly
    default-expand-all
    :data="data"
    node-key="deptId"
    :props="{ label: 'deptName' }"
    v-model="model"
    :placeholder="placeholder"
    class="ele-fluid"
    :popper-options="{ strategy: 'fixed' }"
  />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { EleMessage, toTree } from 'ele-admin-plus/es';
  import { listDepts } from '@/api/system/dept';

  const props = defineProps({
    /** 提示信息 */
    placeholder: {
      type: String,
      default: '请选择归属部门'
    },
    /** 指定机构下拉数据 */
    organizationData: Array
  });

  /** 选中的部门 */
  const model = defineModel({ type: [Number, String] });

  /** 部门数据 */
  const data = ref([]);

  watch(
    () => props.organizationData,
    (organizationData) => {
      if (organizationData != null) {
        data.value = organizationData;
      }
    },
    {
      immediate: true,
      deep: true
    }
  );

  /** 获取部门数据 */
  const reload = () => {
    if (props.organizationData != null) {
      return;
    }
    listDepts()
      .then((list) => {
        data.value = toTree({
          data: list,
          idField: 'deptId',
          parentIdField: 'parentId'
        });
      })
      .catch((e) => {
        EleMessage.error(e.message);
      });
  };

  reload();

  defineExpose({ reload });
</script>
