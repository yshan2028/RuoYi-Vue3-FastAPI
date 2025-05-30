<template>
  <ele-modal
    :width="460"
    title="用户导入"
    :body-style="{ paddingTop: '8px' }"
    v-model="visible"
  >
    <div v-loading="loading" class="user-import-upload">
      <el-upload
        drag
        action=""
        accept=".xls,.xlsx"
        :show-upload-list="false"
        :before-upload="doUpload"
      >
        <ele-text
          type="primary"
          :icon="CloudUploadOutlined"
          :icon-props="{ size: 52 }"
          style="margin-bottom: 10px"
        />
        <ele-text type="placeholder">将文件拖到此处, 或点击上传</ele-text>
      </el-upload>
    </div>
    <div style="display: flex; align-items: center">
      <ele-text size="sm" type="secondary" style="line-height: 17px; flex: 1">
        <span style="padding-right: 8px">只能上传 xls、xlsx 文件,</span>
        <el-link
          type="primary"
          :underline="false"
          style="font-size: inherit; line-height: inherit; vertical-align: 0"
          @click="handleDownload"
        >
          下载模板
        </el-link>
      </ele-text>
      <el-checkbox v-model="isUpdate" style="height: 18px; flex-shrink: 0">
        更新已存在用户
      </el-checkbox>
    </div>
  </ele-modal>
</template>

<script setup>
  import { ref, h } from 'vue';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { CloudUploadOutlined } from '@/components/icons';
  import { importUsers, downloadTemplate } from '@/api/system/user';

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 导入请求状态 */
  const loading = ref(false);

  /** 是否更新已存在数据 */
  const isUpdate = ref(false);

  /** 上传 */
  const doUpload = (file) => {
    if (
      ![
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ].includes(file.type)
    ) {
      EleMessage.error('只能选择 excel 文件');
      return false;
    }
    if (file.size / 1024 / 1024 > 10) {
      EleMessage.error('大小不能超过 10MB');
      return false;
    }
    loading.value = true;
    importUsers(file, isUpdate.value)
      .then((msg) => {
        loading.value = false;
        ElMessageBox({
          type: 'success',
          title: '导入结果',
          message: h('div', { innerHTML: msg }),
          customStyle: { maxWidth: '442px' },
          draggable: true
        })
          .then(() => {})
          .catch(() => {});
        visible.value = false;
        emit('done');
      })
      .catch((e) => {
        loading.value = false;
        ElMessageBox({
          type: 'error',
          title: '导入结果',
          message: h('div', { innerHTML: e.message }),
          customStyle: { maxWidth: '442px' },
          draggable: true
        })
          .then(() => {})
          .catch(() => {});
      });
    return false;
  };

  /** 下载模板 */
  const handleDownload = () => {
    const loading = EleMessage.loading({
      message: '请求中..',
      plain: true
    });
    downloadTemplate()
      .then(() => {
        loading.close();
      })
      .catch((e) => {
        loading.close();
        EleMessage.error(e.message);
      });
  };
</script>

<style lang="scss" scoped>
  .user-import-upload {
    margin-bottom: 12px;

    :deep(.el-upload > .el-upload-dragger) {
      padding: 0;
      height: 168px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: (border-color 0.2s, background-color 0.2s);

      &:not(.is-dragover) {
        background: var(--el-fill-color-light);
      }
    }

    :deep(.el-upload-list) {
      display: none;
    }

    :deep(.el-icon > svg) {
      stroke-width: 3;
    }
  }
</style>
