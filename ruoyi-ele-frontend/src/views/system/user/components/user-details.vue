<template>
  <ele-modal
    class="user-detail-modal"
    :model-value="modelValue"
    title="用户详情"
    @update:modelValue="updateModelValue"
  >
    <el-descriptions v-if="userInfo" :border="true" :column="getColumnCount()" class="detail-table" :size="'small'" :direction="'horizontal'">
      <el-descriptions-item label="用户名称">{{ userInfo.userName }}</el-descriptions-item>
      <el-descriptions-item label="用户昵称">{{ userInfo.nickName }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ userInfo.sex === '1' ? '男' : '女' }}</el-descriptions-item>

      <el-descriptions-item label="头像">
        <el-avatar v-if="userInfo.avatar" :src="userInfo.avatar" :size="40" />
        <el-avatar v-else style="background: #1677ff" :size="40">
          {{ userInfo.nickName ? userInfo.nickName.slice(-2) : '' }}
        </el-avatar>
      </el-descriptions-item>
      <el-descriptions-item label="手机号">{{ userInfo.phonenumber }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>

      <el-descriptions-item label="角色">
        <el-tag v-for="role in userInfo.role" :key="role.roleId" size="small" :disable-transitions="true">
          {{ role.roleName }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="岗位">
        <el-tag v-for="post in userInfo.posts" :key="post.postId" type="info">
          {{ post.postName }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="部门">{{ userInfo.dept ? userInfo.dept.deptName : '无' }}</el-descriptions-item>

      <el-descriptions-item label="部门负责人">{{ userInfo.dept ? userInfo.dept.leader : '无' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <ele-dot v-if="userInfo.status === '0'" text="正常" size="9px" />
        <ele-dot v-else text="冻结" type="danger" :ripple="false" size="9px" />
      </el-descriptions-item>
      <el-descriptions-item label="管理员">
        <el-tag v-if="userInfo.admin" type="danger">是</el-tag>
        <el-tag v-else type="info">否</el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">{{ userInfo.createTime }}</el-descriptions-item>
      <el-descriptions-item label="最后登录 IP">{{ userInfo.loginIp }}</el-descriptions-item>
      <el-descriptions-item label="最后登录时间">{{ userInfo.loginDate }}</el-descriptions-item>
    </el-descriptions>
    <div v-else class="loading-text">加载中...</div>
  </ele-modal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getUser } from '@/api/system/user';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: Boolean,
  userId: Number,
});

const userInfo = ref({ role: [], posts: [], dept: {} });
const windowWidth = ref(window.innerWidth);

const getColumnCount = () => {
  if (windowWidth.value > 1200) return 3;
  if (windowWidth.value > 800) return 2;
  return 1;
};

watch(
  () => props.userId,
  async (newId) => {
    if (!newId) {
      userInfo.value = { role: [], posts: [], dept: {} };
      return;
    }
    try {
      console.log('🔍 请求用户详情: ', `/api/system/user/${newId}`);
      const response = await getUser(newId);
      userInfo.value = {
        ...response.data,
        role: response.data.role || [],
        posts: response.posts || [],
        dept: response.data.dept || {},
      };
    } catch (error) {
      console.error('获取用户详情失败', error);
      userInfo.value = { role: [], posts: [], dept: {} };
    }
  },
  { immediate: true }
);

const updateModelValue = (value) => {
  emit('update:modelValue', value);
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.user-detail-modal {
  max-width: 90vw;
}
.detail-table :deep(.el-descriptions__label) {
  min-width: 120px;
  text-align: right;
  font-weight: normal;
}
.loading-text {
  text-align: center;
  font-size: 16px;
  padding: 20px;
}
</style>
