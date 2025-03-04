import { h } from 'vue';
import ProFormContent from './components/pro-form-content.vue';

/**
 * 内置的组件类型
 */
export const defaultTypes = [
  'input',
  'textarea',
  'select',
  'multipleSelect',
  'radio',
  'radioButton',
  'checkbox',
  'checkboxButton',
  'date',
  'datetime',
  'daterange',
  'datetimerange',
  'time',
  'timerange',
  'timeSelect',
  'editTag',
  'switch',
  'rate',
  'inputNumber',
  'cascader',
  'treeSelect',
  'treeMultipleSelect',
  'virtualTreeSelect',
  'virtualTreeMultipleSelect',
  'tableSelect',
  'tableMultipleSelect',
  'checkCard',
  'multipleCheckCard',
  'autocomplete',
  'imageUpload',
  'fileUpload',
  'regions',
  'dictRadio',
  'dictCheckbox',
  'dictSelect',
  'dictMultipleSelect',
  'slider',
  'sliderRange',
  'editor',
  'text',
  // 展示类型
  'label',
  'divider',
  'button',
  'steps',
  // 容器类型
  'card',
  'tabs',
  'table',
  'collapse',
  'collapseItem',
  'row',
  'col',
  'div'
];

/**
 * 展示类型组件
 */
export const viewTypes = ['label', 'divider', 'button', 'steps'];

/**
 * 容器类型组件
 */
export const containerTypes = [
  'card',
  'tabs',
  'table',
  'collapse',
  'collapseItem',
  'row',
  'col',
  'div'
];

/**
 * 选择类型的组件类型
 */
export const selectTypes = [
  'select',
  'multipleSelect',
  'radio',
  'radioButton',
  'checkbox',
  'checkboxButton',
  'date',
  'datetime',
  'daterange',
  'datetimerange',
  'time',
  'timerange',
  'timeSelect',
  'switch',
  'cascader',
  'rate',
  'slider',
  'sliderRange',
  'treeSelect',
  'tableMultipleSelect',
  'virtualTreeSelect',
  'virtualTreeMultipleSelect',
  'tableSelect',
  'tableMultipleSelect',
  'checkCard',
  'multipleCheckCard',
  'dictRadio',
  'dictSelect',
  'dictCheckbox',
  'dictMultipleSelect',
  'regions'
];

/**
 * 上传类型的组件类型
 */
export const uploadTypes = ['imageUpload', 'fileUpload'];

/**
 * 支持options配置下拉选项数据的组件类型
 */
export const optionsTypes = [
  'select',
  'multipleSelect',
  'radio',
  'radioButton',
  'checkbox',
  'checkboxButton',
  'autocomplete',
  'cascader',
  'treeSelect',
  'treeMultipleSelect',
  'checkCard',
  'multipleCheckCard'
];

/**
 * 表单验证规则使用blur触发的组件类型
 */
export const blurTypes = ['input', 'textarea'];

/**
 * 表单数据类型为字符串的组件类型
 */
export const stringTypes = [
  'input',
  'textarea',
  'date',
  'datetime',
  'time',
  'timeSelect',
  'autocomplete',
  'editor',
  'text'
];

/**
 * 表单数据类型为数字的组件类型
 */
export const numberTypes = [
  'select',
  'radio',
  'radioButton',
  'checkbox',
  'checkboxButton',
  'switch',
  'inputNumber',
  'rate',
  'slider',
  'tableSelect'
];

/**
 * 表单数据类型为数组的组件类型
 */
export const arrayTypes = [
  'multipleSelect',
  'checkbox',
  'checkboxButton',
  'daterange',
  'datetimerange',
  'timerange',
  'cascader',
  'sliderRange',
  'treeMultipleSelect',
  'virtualTreeMultipleSelect',
  'tableMultipleSelect',
  'multipleCheckCard',
  'editTag',
  'dictCheckbox',
  'dictMultipleSelect',
  'regions'
];

/**
 * 获取验证规则值类型
 * @param type 组件类型
 */
export function getRuleType(type) {
  if (type) {
    if (arrayTypes.includes(type)) {
      return 'array';
    }
    if (numberTypes.includes(type)) {
      return 'number';
    }
  }
  return 'string';
}

/**
 * 获取验证规则触发类型
 * @param type 组件类型
 */
export function getRuleTrigger(type) {
  return type && blurTypes.includes(type) ? 'blur' : 'change';
}

/**
 * 获取验证规则提示文本
 * @param type 组件类型
 * @param label 表单项标题
 */
export function getRuleMessage(type, label) {
  const text = label ?? '';
  if (type) {
    if (selectTypes.includes(type)) {
      return `请选择${text}`;
    }
    if (uploadTypes.includes(type)) {
      return `请上传${text}`;
    }
  }
  return `请输入${text}`;
}

/**
 * 判断表单项是否展示
 * @param item 表单项
 * @param form 表单数据
 * @param items 表单项数据
 * @param searchExpand 搜索表单展开状态
 */
export function isShowItem(item, form, items, searchExpand) {
  if (!item.prop) {
    return false;
  }
  if (item.vIf != null) {
    if (typeof item.vIf === 'function') {
      return item.vIf(form);
    }
    if (typeof item.vIf === 'string' && item.vIf.trim().length) {
      try {
        return new Function(
          'form',
          'items',
          'searchExpand',
          `return (${item.vIf})`
        )(form, items, searchExpand);
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    if (item.vIf === false) {
      return false;
    }
  }
  return true;
}

/**
 * 自定义容器组件时子组件渲染器
 * @param props 属性
 * @param context 上下文
 */
export function ChildrenRender(props, { emit }) {
  return h(
    ProFormContent,
    {
      model: props.model,
      rules: props.rules,
      items: props.item.children ?? [],
      grid: props.item.grid,
      rowProps: props.item.rowProps,
      formItems: props.formItems,
      searchExpand: props.searchExpand,
      onUpdateItemValue: (prop, value) => {
        emit('updateItemValue', prop, value);
      }
    },
    props.slots
  );
}
