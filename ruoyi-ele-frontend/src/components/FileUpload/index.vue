<template>
  <CommonUpload
    v-model="files"
    :fileLimit="fileLimit"
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
    :beforePreview="handleBeforePreview"
    :locale="locale"
  />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import CommonUpload from '../CommonUpload/index.vue';

  defineOptions({ name: 'FileUpload' });

  const props = defineProps({
    /** 绑定值 */
    modelValue: String,
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
    listType: {
      type: String,
      default: 'file'
    },
    /** 上传按钮点击前的钩子 */
    beforeUploadClick: Function,
    /** 修改按钮点击前的钩子 */
    beforeItemEdit: Function,
    /** 国际化 */
    locale: Object
  });

  const emit = defineEmits(['update:modelValue', 'change']);

  /** 上传组件数据 */
  const files = ref([]);

  /** 判断是否是图片 */
  const isImage = (url) => {
    const parts = url ? url.split('.') : [];
    const suffix =
      parts.length <= 1 || (parts[0] === '' && parts.length === 2)
        ? ''
        : parts.pop()?.toLowerCase?.();
    return suffix && ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(suffix);
  };

  /** 图片预览钩子 */
  const handleBeforePreview = (item) => {
    if (!isImage(item.url)) {
      if (item.url) {
        window.open(item.url);
      } else if (item.file && !item.file.type.startsWith('image')) {
        window.open(URL.createObjectURL(item.file));
      }
      return false;
    }
  };

  /** 更新绑定值 */
  const updateModelValue = (value) => {
    const oldValue = props.modelValue ?? '';
    const newValue = value ?? '';
    if (oldValue !== newValue) {
      emit('update:modelValue', newValue);
      emit('change', value);
    }
  };

  /** 清空上传组件数据 */
  const clearData = () => {
    files.value = [];
  };

  /** 判断是否全部上传完成 */
  const isDone = () => {
    return !files.value.some((d) => d.status !== 'done');
  };

  /** 获取上传数据对应的值 */
  const getDataValue = (filesValue) => {
    const result = [];
    filesValue.forEach((item) => {
      if (item.status === 'done' && item.url != null) {
        result.push({ url: item.url, name: item.name });
      }
    });
    return result;
  };

  /** 获取值对应的上传数据 */
  const getFilesValue = (dataValue, filesValue) => {
    if (!dataValue) {
      return filesValue.filter((item) => item.status !== 'done');
    }
    const result = [];
    if (props.limit === 1) {
      try {
        const temp = JSON.parse(dataValue);
        if (temp) {
          const url = temp.url ?? '';
          result.push({
            key: `0-${url}`,
            url,
            name: temp.name ?? '',
            status: 'done',
            thumbnail: isImage(url)
          });
          return result;
        }
      } catch (e) {
        console.error(e);
      }
      const temp = filesValue.find((item) => item.status !== 'done');
      if (temp != null) {
        result.push(temp);
      }
      return result;
    }
    try {
      const temps = JSON.parse(dataValue);
      filesValue.forEach((item) => {
        if (
          (item.url && temps.some((temp) => temp.url === item.url)) ||
          item.status !== 'done'
        ) {
          result.push(item);
        }
      });
      temps.forEach((temp, index) => {
        const url = temp?.url ?? '';
        if (url && !result.some((item) => item.url === url)) {
          const key = `${index}-${url}`;
          const oldIndex = result.findIndex((item) => item.key === key);
          if (oldIndex !== -1) {
            result.splice(oldIndex, 1);
          }
          result.push({
            key,
            url,
            name: temp.name ?? '',
            status: 'done',
            thumbnail: isImage(url)
          });
        }
      });
      if (props.limit != null && result.length > props.limit) {
        const temp = result.filter((item) => item.status !== 'done');
        for (const t of temp) {
          const i = result.indexOf(t);
          result.splice(i, 1);
          if (result.length <= props.limit) {
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      filesValue.forEach((item) => {
        if (item.status !== 'done') {
          result.push(item);
        }
      });
    }
    return result;
  };

  /** 判断上传数据是否改变 */
  const filesIsChanged = (newFiles, oldFiles) => {
    if (newFiles.length !== oldFiles.length) {
      return true;
    }
    for (let i = 0; i < newFiles.length; i++) {
      const newItem = newFiles[i];
      const oldItem = oldFiles[i];
      if (
        newItem.key !== oldItem.key ||
        newItem.name !== oldItem.name ||
        newItem.url !== oldItem.url ||
        newItem.status !== oldItem.status
      ) {
        return true;
      }
    }
    return false;
  };

  /** 同步绑定值 */
  watch(
    files,
    (filesValue) => {
      const dataValue = getDataValue(filesValue);
      if (props.limit === 1) {
        updateModelValue(dataValue.length ? JSON.stringify(dataValue[0]) : '');
        return;
      }
      updateModelValue(dataValue.length ? JSON.stringify(dataValue) : '');
    },
    { deep: true }
  );

  watch(
    () => props.modelValue,
    (dataValue) => {
      const filesValue = getFilesValue(dataValue, files.value);
      if (filesIsChanged(filesValue, files.value)) {
        files.value = filesValue;
      }
    },
    { immediate: true }
  );

  defineExpose({ clearData, isDone });
</script>
