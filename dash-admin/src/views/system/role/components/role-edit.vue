<!-- 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="680"
    position="center"
    v-model="visible"
    :body-style="{ paddingLeft: '0px' }"
    :title="isUpdate ? '修改角色' : '添加角色'"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="108px"
      @submit.prevent=""
    >
      <el-row>
        <el-col :sm="12" :xs="24">
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              clearable
              v-model="form.roleName"
              placeholder="请输入角色名称"
            />
          </el-form-item>
          <el-form-item label="显示顺序" prop="roleSort">
            <el-input-number
              :min="0"
              :max="99999"
              v-model="form.roleSort"
              placeholder="请输入显示顺序"
              controls-position="right"
              class="ele-fluid"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item prop="roleKey">
            <template #label>
              <ele-tooltip
                content="控制器中定义的权限字符, 如: @PreAuthorize(`@ss.hasRole('admin')`)"
                :bodyStyle="{ maxWidth: '268px' }"
                placement="top-start"
                :popper-options="{
                  modifiers: [
                    { name: 'offset', options: { offset: [-12, 10] } }
                  ]
                }"
              >
                <el-icon
                  :size="15"
                  style="align-self: center; margin-right: 2px; cursor: help"
                >
                  <QuestionCircleOutlined style="opacity: 0.6" />
                </el-icon>
              </ele-tooltip>
              <span>权限字符</span>
            </template>
            <el-input
              clearable
              v-model="form.roleKey"
              placeholder="请输入权限字符"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <dict-data
              code="sys_normal_disable"
              type="radio"
              v-model="form.status"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="菜单权限">
        <ele-loading :loading="menuLoading" class="role-menu-tree">
          <div style="line-height: 1; padding: 0 6px 0 0">
            <el-button
              class="ele-btn-icon"
              size="small"
              style="margin: 0 0 6px 6px"
              @click="expandAll"
            >
              展开全部
            </el-button>
            <el-button
              class="ele-btn-icon"
              size="small"
              style="margin: 0 0 6px 6px"
              @click="foldAll"
            >
              折叠全部
            </el-button>
            <el-button
              class="ele-btn-icon"
              size="small"
              style="margin: 0 0 6px 6px"
              @click="checkAll"
            >
              全选
            </el-button>
            <el-button
              class="ele-btn-icon"
              size="small"
              style="margin: 0 0 6px 6px"
              @click="checkOutAll"
            >
              取消全选
            </el-button>
          </div>
          <div style="height: 260px; overflow: auto; padding: 0 6px">
            <el-tree
              ref="treeRef"
              show-checkbox
              node-key="id"
              :data="menuData"
              :default-checked-keys="checkedKeys"
            />
          </div>
        </ele-loading>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          :rows="3"
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
  import { EleMessage, eachTree } from 'ele-admin-plus/es';
  import { QuestionCircleOutlined } from '@/components/icons';
  import { useFormData } from '@/utils/use-form-data';
  import { addRole, updateRole, listRoleMenus } from '@/api/system/role';

  const props = defineProps({
    /** 修改回显的数据 */
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 菜单树组件 */
  const treeRef = ref(null);

  /** 菜单数据 */
  const menuData = ref([]);

  /** 菜单数据请求状态 */
  const menuLoading = ref(false);

  /** 菜单回显选中 */
  const checkedKeys = ref([]);

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    roleId: void 0,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: ''
  });

  /** 表单验证规则 */
  const rules = reactive({
    roleName: [
      {
        required: true,
        message: '请输入角色名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    roleKey: [
      {
        required: true,
        message: '请输入权限字符',
        type: 'string',
        trigger: 'blur'
      }
    ],
    roleSort: [
      {
        required: true,
        message: '请输入显示顺序',
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
      const menuIds =
        (treeRef.value?.getCheckedKeys?.() ?? []).concat(
          treeRef.value?.getHalfCheckedKeys?.() ?? []
        ) ?? [];
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? updateRole : addRole;
      saveOrUpdate({ ...form, menuIds })
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

  /** 展开全部 */
  const expandAll = () => {
    eachTree(menuData.value, (d) => {
      const node = treeRef.value?.getNode?.(d);
      node.expand(null, false);
    });
  };

  /** 折叠全部 */
  const foldAll = () => {
    eachTree(menuData.value, (d) => {
      const node = treeRef.value?.getNode?.(d);
      node.collapse();
    });
  };

  /** 全选 */
  const checkAll = () => {
    const keys = [];
    eachTree(menuData.value, (d) => {
      keys.push(d.id);
    });
    treeRef.value?.setCheckedKeys?.(keys);
  };

  /** 取消全选 */
  const checkOutAll = () => {
    treeRef.value?.setCheckedKeys?.([]);
  };

  /** 查询菜单数据 */
  const query = () => {
    menuData.value = [];
    checkedKeys.value = [];
    menuLoading.value = true;
    listRoleMenus(props.data?.roleId)
      .then((result) => {
        menuLoading.value = false;
        menuData.value = result.menus;
        const cks = [];
        eachTree(menuData.value, (d) => {
          if (!d.children?.length && result.checkedKeys?.includes?.(d.id)) {
            cks.push(d.id);
          }
        });
        checkedKeys.value = cks;
      })
      .catch((e) => {
        menuLoading.value = false;
        EleMessage.error(e.message);
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
    query();
    nextTick(() => {
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    });
  };
</script>

<style lang="scss" scoped>
  .role-menu-tree {
    width: 100%;
    padding: 6px 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    box-sizing: border-box;
    overflow: hidden;
  }
</style>
