<template>
  <EleUploadList
    v-model="images"
    :readonly="readonly"
    :disabled="disabled"
    :preview="preview"
    :limit="limit"
    :multiple="multiple"
    :drag="drag"
    :accept="accept"
    :itemStyle="itemStyle"
    :buttonStyle="buttonStyle"
    :sortable="sortable"
    :imageProps="imageProps"
    :progressProps="progressProps"
    :previewProps="previewProps"
    :tools="tools"
    :listType="listType"
    :beforeUploadClick="beforeUploadClick"
    :beforeItemEdit="beforeItemEdit"
    :beforePreview="beforePreview"
    :locale="locale"
    @upload="handleItemUpload"
    @retry="(item) => handleItemUpload(item, true)"
    @remove="handleItemRemove"
    @editUpload="handleItemEditUpload"
    @itemClick="handleItemClick"
    @preview="handleItemPreview"
  >
    <template v-for="name in Object.keys($slots)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </EleUploadList>
</template>

<script setup>
  import { EleMessage } from 'ele-admin-plus/es';
  import { uploadFile } from '@/api/system/file';

  defineOptions({ name: 'CommonUpload' });

  const props = defineProps({
    /** 文件大小限制, 单位MB */
    fileLimit: {
      type: Number,
      default: 100
    },
    /** 是否只读 */
    readonly: Boolean,
    /** 是否禁用 */
    disabled: Boolean,
    /** 是否支持点击预览 */
    preview: {
      type: Boolean,
      default: true
    },
    /** 最大上传数量 */
    limit: Number,
    /** 是否支持多选文件 */
    multiple: Boolean,
    /** 是否启用拖拽上传 */
    drag: {
      type: Boolean,
      default: true
    },
    /** 接受上传的文件类型 */
    accept: {
      type: String,
      default: ''
    },
    /** 自定义样式 */
    itemStyle: Object,
    /** 自定义上传按钮样式 */
    buttonStyle: Object,
    /** 是否开启拖拽排序 */
    sortable: {
      type: [Boolean, Object],
      default: () => {
        return { forceFallback: true };
      }
    },
    /** 自定义图片属性 */
    imageProps: Object,
    /** 自定义进度条属性 */
    progressProps: Object,
    /** 自定义图片预览属性 */
    previewProps: Object,
    /** 是否开启底部预览和修改的操作按钮 */
    tools: {
      type: Boolean,
      default: true
    },
    /** 列表显示样式 */
    listType: String,
    /** 上传按钮点击前的钩子 */
    beforeUploadClick: Function,
    /** 修改按钮点击前的钩子 */
    beforeItemEdit: Function,
    /** 预览按钮点击前的钩子 */
    beforePreview: Function,
    /** 国际化 */
    locale: Object
  });

  const emit = defineEmits(['itemClick', 'preview']);

  /** 已上传数据 */
  const images = defineModel({
    type: Array,
    default: () => []
  });

  /** 校验选择的文件 */
  const checkFile = (file) => {
    if (!file) {
      return;
    }
    if (props.accept === 'image/*') {
      if (!file.type.startsWith('image')) {
        EleMessage.error('只能选择图片');
        return;
      }
    } else if (props.accept === '.xls,.xlsx') {
      if (
        ![
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ].includes(file.type)
      ) {
        EleMessage.error('只能选择 excel 文件');
        return;
      }
    }
    if (props.fileLimit && file.size / 1024 / 1024 > props.fileLimit) {
      EleMessage.error(`大小不能超过 ${props.fileLimit}MB`);
      return;
    }
    return true;
  };

  /** 上传事件 */
  const handleItemUpload = (data, retry) => {
    if (!data.file || !checkFile(data.file)) {
      return;
    }
    if (!retry) {
      images.value.push({ ...data });
    }
    const item = images.value.find((t) => t.key === data.key);
    if (!item) {
      return;
    }
    item.status = 'uploading';
    item.progress = 0;
    uploadFile(data.file, {
      onUploadProgress: (e) => {
        if (e.total != null && item.status !== 'done') {
          item.progress = (e.loaded / e.total) * 100;
        }
      }
    })
      .then((res) => {
        item.progress = 100;
        item.status = 'done';
        item.url = res.url;
      })
      .catch((e) => {
        item.status = 'exception';
        EleMessage.error(e.message);
      });
  };

  /** 修改事件 */
  const handleItemEditUpload = ({ item, newItem }) => {
    if (!checkFile(newItem.file)) {
      return;
    }
    const oldItem = images.value.find((t) => t.key === item.key);
    if (oldItem) {
      oldItem.url = void 0;
      oldItem.name = newItem.name;
      oldItem.file = newItem.file;
      oldItem.progress = 0;
      oldItem.status = void 0;
      handleItemUpload(oldItem, true);
    }
  };

  /** 删除事件 */
  const handleItemRemove = (item) => {
    images.value.splice(images.value.indexOf(item), 1);
  };

  /** 点击事件 */
  const handleItemClick = (item) => {
    emit('itemClick', item);
  };

  /** 预览事件 */
  const handleItemPreview = (item) => {
    emit('preview', item);
  };
</script>
