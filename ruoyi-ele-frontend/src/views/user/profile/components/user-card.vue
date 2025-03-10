<template>
  <ele-card>
    <div class="info-user">
      <div class="info-user-avatar" @click="openCropper">
        <el-avatar :size="100" :src="data.avatar" />
        <el-icon class="info-user-avatar-icon">
          <CloudUploadOutlined style="stroke-width: 3" />
        </el-icon>
      </div>
      <ele-text size="xxl" style="margin-top: 5px">
        {{ data.nickName }}
      </ele-text>
      <ele-text type="placeholder">
        <span>{{ data.dept?.deptName }}</span>
        <span style="padding: 0 8px">/</span>
        <span>{{ data.postGroup }}</span>
      </ele-text>
    </div>
    <el-divider border-style="dashed" style="margin: 22px 0" />
    <div class="info-list">
      <div class="info-item">
        <el-icon>
          <UserOutlined />
        </el-icon>
        <div class="info-item-text">
          <span>用户名称:</span>
          <span>{{ data.userName }}</span>
        </div>
      </div>
      <div class="info-item">
        <el-icon>
          <MobileOutlined />
        </el-icon>
        <div class="info-item-text">
          <span>手机号码:</span>
          <span>{{ data.phonenumber }}</span>
        </div>
      </div>
      <div class="info-item">
        <el-icon>
          <MailOutlined />
        </el-icon>
        <div class="info-item-text">
          <span>邮箱账号:</span>
          <span>{{ data.email }}</span>
        </div>
      </div>
      <div class="info-item">
        <el-icon>
          <IdcardOutlined />
        </el-icon>
        <div class="info-item-text">
          <span>所属角色:</span>
          <span>{{ data.roleGroup }}</span>
        </div>
      </div>
    </div>
    <!-- 头像裁剪弹窗 -->
    <ele-cropper-modal
      v-model="visible"
      :src="data.avatar"
      :options="{
        aspectRatio: 1,
        autoCropArea: 1,
        viewMode: 1,
        dragMode: 'move'
      }"
      :to-blob="true"
      :modal-props="{ destroyOnClose: true }"
      @done="handleCrop"
    />
  </ele-card>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import {
    CloudUploadOutlined,
    UserOutlined,
    MobileOutlined,
    MailOutlined,
    IdcardOutlined
  } from '@/components/icons';
  import { uploadAvatar } from '@/api/profile';
  import { API_BASE_URL } from '@/config/setting';

  const emit = defineEmits(['done']);

  defineProps({
    data: Object
  });

  /** 是否显示裁剪弹窗 */
  const visible = ref(false);

  /** 打开图片裁剪 */
  const openCropper = () => {
    visible.value = true;
  };

  /** 头像裁剪完成回调 */
  const handleCrop = (blob) => {
    const formData = new FormData();
    formData.append('avatarfile', blob, 'avatar.png');
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
    uploadAvatar(formData)
      .then((res) => {
        loading.close();
        visible.value = false;
        EleMessage.success('修改成功');
        emit('done', { avatar: API_BASE_URL + res.imgUrl });
      })
      .catch((e) => {
        loading.close();
        EleMessage.error(e.message);
      });
  };
</script>

<style lang="scss" scoped>
  .info-user {
    box-sizing: border-box;
    text-align: center;

    .info-user-avatar {
      display: inline-block;
      position: relative;
      cursor: pointer;
      line-height: 0;

      .info-user-avatar-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 30px;
        display: none;
        z-index: 2;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: transparent;
        transition: background-color 0.3s;
      }

      &:hover {
        .info-user-avatar-icon {
          display: block;
        }

        &::after {
          background-color: rgba(0, 0, 0, 0.4);
        }
      }
    }
  }

  .info-list .info-item {
    display: flex;
    align-items: center;

    & > .el-icon {
      font-size: 16px;
      transform: translateY(-1px);
    }

    .info-item-text {
      flex: 1;
      padding-left: 8px;
      box-sizing: border-box;

      & > span + span {
        margin-left: 8px;
      }
    }

    & + .info-item {
      margin-top: 12px;
    }
  }
</style>
