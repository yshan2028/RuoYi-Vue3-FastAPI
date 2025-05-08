<!-- 编辑弹窗 -->
<template>
  <ele-drawer
    :size="1320"
    style="max-width: 100%"
    :append-to-body="true"
    :destroy-on-close="true"
    :body-style="{ padding: '16px 10px' }"
    :footer-style="{ display: 'flex', alignItems: 'center' }"
    :title="`修改[${data?.tableName}]生成配置`"
    v-model="visible"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <ele-loading :loading="initLoading" style="padding-top: 2px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="112px"
        class="form-box"
        @submit.prevent=""
      >
        <el-divider content-position="left" style="margin-top: 10px">
          基本信息
        </el-divider>
        <el-row :gutter="18">
          <el-col :sm="8" :xs="24">
            <el-form-item label="表名称" prop="tableName">
              <el-input
                clearable
                v-model="form.tableName"
                placeholder="请输入表名称"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="表描述" prop="tableComment">
              <el-input
                clearable
                v-model="form.tableComment"
                placeholder="请输入表描述"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="实体类名称" prop="className">
              <el-input
                clearable
                v-model="form.className"
                placeholder="请输入实体类名称"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :xs="24">
            <el-form-item label="备注">
              <el-input
                :rows="2"
                type="textarea"
                v-model="form.remark"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-divider content-position="left">生成信息</el-divider>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="作者" prop="functionAuthor">
              <el-input
                clearable
                v-model="form.functionAuthor"
                placeholder="请输入作者"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="16" :xs="24">
            <el-form-item prop="packageName">
              <template #label>
                <gen-edit-tip
                  tip="生成在哪个java包下，例如：com.ruoyi.system"
                  label="生成包路径"
                />
              </template>
              <el-input
                clearable
                v-model="form.packageName"
                placeholder="请输入生成包路径"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item prop="moduleName">
              <template #label>
                <gen-edit-tip
                  tip="可理解为子系统名，例如：system"
                  label="生成模块名"
                />
              </template>
              <el-input
                clearable
                v-model="form.moduleName"
                placeholder="请输入生成模块名"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item prop="businessName">
              <template #label>
                <gen-edit-tip
                  tip="可理解为功能英文名，例如：user"
                  label="生成业务名"
                />
              </template>
              <el-input
                clearable
                v-model="form.businessName"
                placeholder="请输入生成业务名"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item prop="functionName">
              <template #label>
                <gen-edit-tip tip="用作类描述，例如：用户" label="生成功能名" />
              </template>
              <el-input
                clearable
                v-model="form.functionName"
                placeholder="请输入生成功能名"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="生成模板" prop="tplCategory">
              <el-select
                v-model="form.tplCategory"
                placeholder="请选择生成模板"
                class="ele-fluid"
                :popper-options="{ strategy: 'fixed' }"
              >
                <el-option label="单表(增删改查)" value="crud" />
                <el-option label="树表(增删改查)" value="tree" />
                <el-option label="主子表(增删改查)" value="sub" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="默认为zip压缩包下载，也可以自定义生成路径"
                  label="生成代码方式"
                />
              </template>
              <el-radio-group v-model="form.genType">
                <el-radio value="0" label="zip压缩包" />
                <el-radio value="1" label="自定义路径" />
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="分配到指定菜单下，例如：系统管理"
                  label="上级菜单"
                />
              </template>
              <menu-select v-model="form.parentMenuId" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.genType == '1'" :span="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="填写磁盘绝对路径，若不填写，则生成到当前 Web 项目下"
                  label="自定义路径"
                />
              </template>
              <el-input
                clearable
                v-model="form.genPath"
                placeholder="请输入自定义路径"
              >
                <template #append>
                  <ele-dropdown
                    :items="[
                      { title: '恢复默认的生成基础路径', command: 'reset' }
                    ]"
                    placement="bottom-end"
                    :popper-options="{
                      strategy: 'fixed',
                      modifiers: [
                        { name: 'offset', options: { offset: [12, 12] } }
                      ]
                    }"
                    @command="handleDropClick"
                  >
                    <div style="cursor: pointer">
                      <span>最近路径快速选择</span>
                      <el-icon :size="12" style="margin: 0 -4px 0 2px">
                        <ArrowDown />
                      </el-icon>
                    </div>
                  </ele-dropdown>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="form.tplCategory == 'tree'" :span="24">
            <el-divider content-position="left">其它信息</el-divider>
          </el-col>
          <el-col v-if="form.tplCategory == 'tree'" :sm="8" :xs="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="树显示的编码字段名，如：dept_id"
                  label="树编码字段"
                />
              </template>
              <column-select
                :data="cols"
                v-model="form.treeCode"
                placeholder="请选择树编码字段"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tplCategory == 'tree'" :sm="8" :xs="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="树显示的父编码字段名，如：parent_Id"
                  label="树父编码字段"
                />
              </template>
              <column-select
                :data="cols"
                v-model="form.treeParentCode"
                placeholder="请选择树父编码字段"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tplCategory == 'tree'" :sm="8" :xs="24">
            <el-form-item>
              <template #label>
                <gen-edit-tip
                  tip="树节点的显示名称字段名，如：dept_name"
                  label="树名称字段"
                />
              </template>
              <column-select
                :data="cols"
                v-model="form.treeName"
                placeholder="请选择树名称字段"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tplCategory == 'sub'" :span="24">
            <el-divider content-position="left">关联信息</el-divider>
          </el-col>
          <el-col v-if="form.tplCategory == 'sub'" :sm="8" :xs="24">
            <el-form-item label="关联子表的表名">
              <el-select
                clearable
                v-model="form.subTableName"
                placeholder="请选择关联子表的表名"
                class="ele-fluid"
                :popper-options="{ strategy: 'fixed' }"
              >
                <el-option
                  v-for="item in tables"
                  :key="item.tableName"
                  :value="item.tableName"
                  :label="`${item.tableName}: ${item.tableComment}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.tplCategory == 'sub'" :sm="8" :xs="24">
            <el-form-item label="子表关联的外键名">
              <el-select
                clearable
                v-model="form.subTableFkName"
                placeholder="请选择子表关联的外键名"
                class="ele-fluid"
                :popper-options="{ strategy: 'fixed' }"
              >
                <el-option
                  v-for="item in tableCols"
                  :key="item.columnName"
                  :value="item.columnName"
                  :label="`${item.columnName}: ${item.columnComment}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">字段信息</el-divider>
        <sticky-table class="form-table" :table-style="{ minWidth: '1280px' }">
          <template #colgroup>
            <col width="38px" />
            <col />
            <col width="140px" />
            <col />
            <col width="120px" />
            <col width="120px" />
            <col width="48px" />
            <col width="48px" />
            <col width="48px" />
            <col width="48px" />
            <col width="100px" />
            <col width="48px" />
            <col width="128px" />
            <col width="128px" />
          </template>
          <template #thead>
            <tr>
              <th class="form-table-index"></th>
              <th>字段列名</th>
              <th>字段描述</th>
              <th>物理类型</th>
              <th>Java类型</th>
              <th>Java属性</th>
              <th>插入</th>
              <th>编辑</th>
              <th>列表</th>
              <th>查询</th>
              <th>查询方式</th>
              <th>必填</th>
              <th>显示类型</th>
              <th>字典类型</th>
            </tr>
          </template>
          <template #tbody>
            <tr v-for="(row, index) in form.columns" :key="row.columnId">
              <td class="form-table-index">{{ index + 1 }}</td>
              <td>{{ row.columnName }}</td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-input v-model="row.columnComment" placeholder="请输入" />
                </el-form-item>
              </td>
              <td>{{ row.columnType }}</td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-select
                    v-model="row.javaType"
                    placeholder="请选择"
                    class="ele-fluid"
                    :popper-options="{ strategy: 'fixed' }"
                  >
                    <el-option label="Long" value="Long" />
                    <el-option label="String" value="String" />
                    <el-option label="Integer" value="Integer" />
                    <el-option label="Double" value="Double" />
                    <el-option label="BigDecimal" value="BigDecimal" />
                    <el-option label="Date" value="Date" />
                    <el-option label="Boolean" value="Boolean" />
                  </el-select>
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  :prop="'columns.' + index + '.javaField'"
                  :rules="{
                    required: true,
                    message: '请输入Java属性',
                    type: 'string',
                    trigger: 'blur'
                  }"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-input v-model="row.javaField" placeholder="请输入" />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-checkbox
                    v-model="row.isInsert"
                    true-value="1"
                    false-value="0"
                  />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-checkbox
                    v-model="row.isEdit"
                    true-value="1"
                    false-value="0"
                  />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-checkbox
                    v-model="row.isList"
                    true-value="1"
                    false-value="0"
                  />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-checkbox
                    v-model="row.isQuery"
                    true-value="1"
                    false-value="0"
                  />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-select
                    v-model="row.queryType"
                    placeholder="请选择"
                    class="ele-fluid"
                    :popper-options="{ strategy: 'fixed' }"
                  >
                    <el-option label="=" value="EQ" />
                    <el-option label="!=" value="NE" />
                    <el-option label=">" value="GT" />
                    <el-option label=">=" value="GTE" />
                    <el-option label="<" value="LT" />
                    <el-option label="<=" value="LTE" />
                    <el-option label="LIKE" value="LIKE" />
                    <el-option label="BETWEEN" value="BETWEEN" />
                  </el-select>
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-checkbox
                    v-model="row.isRequired"
                    true-value="1"
                    false-value="0"
                  />
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-select
                    v-model="row.htmlType"
                    placeholder="请选择"
                    class="ele-fluid"
                    :popper-options="{ strategy: 'fixed' }"
                  >
                    <el-option label="文本框" value="input" />
                    <el-option label="文本域" value="textarea" />
                    <el-option label="下拉框" value="select" />
                    <el-option label="单选框" value="radio" />
                    <el-option label="复选框" value="checkbox" />
                    <el-option label="日期控件" value="datetime" />
                    <el-option label="图片上传" value="imageUpload" />
                    <el-option label="文件上传" value="fileUpload" />
                    <el-option label="富文本控件" value="editor" />
                  </el-select>
                </el-form-item>
              </td>
              <td>
                <el-form-item
                  label-width="0px"
                  class="form-error-popper"
                  style="margin-bottom: 0"
                >
                  <el-select
                    clearable
                    v-model="row.dictType"
                    placeholder="请选择"
                    class="ele-fluid"
                    :popper-options="{ strategy: 'fixed' }"
                  >
                    <el-option
                      v-for="item in dictOptions"
                      :key="item.dictType"
                      :value="item.dictType"
                      :label="`${item.dictName}(${item.dictType})`"
                    />
                  </el-select>
                </el-form-item>
              </td>
            </tr>
          </template>
        </sticky-table>
      </el-form>
    </ele-loading>
    <template #footer>
      <div style="flex: 1; text-align: left">
        <ele-text v-if="validMsg" type="danger" :icon="CloseCircleOutlined">
          <span>{{ validMsg }}</span>
        </ele-text>
      </div>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-drawer>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { CloseCircleOutlined, ArrowDown } from '@/components/icons';
  import { useFormData } from '@/utils/use-form-data';
  import MenuSelect from '@/views/system/menu/components/menu-select.vue';
  import ColumnSelect from './column-select.vue';
  import StickyTable from './sticky-table.vue';
  import GenEditTip from './gen-edit-tip.vue';
  import { listDicts } from '@/api/system/dict';
  import { getGenTable, updateGen } from '@/api/tool/gen';

  const props = defineProps({
    /** 修改回显数据 */
    data: Object
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 字段下拉数据 */
  const cols = ref([]);

  /** 表下拉数据 */
  const tables = ref([]);

  /** 选中的表字段下拉数据 */
  const tableCols = computed(() => {
    const name = form.subTableName;
    if (!name) {
      return [];
    }
    return tables.value.find((t) => t.tableName == name)?.columns ?? [];
  });

  /** 字典类型下拉数据 */
  const dictOptions = ref([]);

  /** 回显查询状态 */
  const initLoading = ref(true);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref(null);

  /** 表单数据 */
  const [form, resetFields, assignFields] = useFormData({
    tableId: void 0,
    tableName: '',
    tableComment: '',
    functionAuthor: '',
    className: '',
    functionName: '',
    businessName: '',
    moduleName: '',
    packageName: '',
    parentMenuId: void 0,
    tplCategory: 'crud',
    genType: '0',
    genPath: '/',
    treeCode: void 0,
    treeParentCode: void 0,
    treeName: void 0,
    subTableName: void 0,
    subTableFkName: void 0,
    remark: '',
    columns: []
  });

  /** 表单验证规则 */
  const rules = reactive({
    tableName: [
      {
        required: true,
        message: '请输入表名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    tableComment: [
      {
        required: true,
        message: '请输入表描述',
        type: 'string',
        trigger: 'blur'
      }
    ],
    functionAuthor: [
      {
        required: true,
        message: '请输入作者',
        type: 'string',
        trigger: 'blur'
      }
    ],
    className: [
      {
        required: true,
        message: '请输入实体类名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    functionName: [
      {
        required: true,
        message: '请输入生成功能名',
        type: 'string',
        trigger: 'blur'
      }
    ],
    businessName: [
      {
        required: true,
        message: '请输入生成业务名',
        type: 'string',
        trigger: 'blur'
      }
    ],
    moduleName: [
      {
        required: true,
        message: '请输入生成模块名',
        type: 'string',
        trigger: 'blur'
      }
    ],
    packageName: [
      {
        required: true,
        message: '请输入生成包路径',
        type: 'string',
        trigger: 'blur'
      }
    ],
    tplCategory: [
      {
        required: true,
        message: '请选择生成模板',
        type: 'string',
        trigger: 'change'
      }
    ]
  });

  /** 表单验证失败提示信息 */
  const validMsg = ref('');

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid, obj) => {
      if (!valid) {
        const errors = obj ? Object.keys(obj).length : 0;
        validMsg.value = ` 共有 ${errors} 项校验不通过`;
        return;
      }
      validMsg.value = '';
      loading.value = true;
      updateGen({
        ...form,
        params: {
          treeCode: form.treeCode,
          treeName: form.treeName,
          treeParentCode: form.treeParentCode,
          parentMenuId: form.parentMenuId
        }
      })
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

  /** 查询回显数据 */
  const handleOpened = () => {
    if (!props.data?.tableId) {
      return;
    }
    initLoading.value = true;
    getGenTable(props.data.tableId)
      .then((res) => {
        assignFields({
          ...res.info,
          parentMenuId:
            res.info.parentMenuId == null || res.info.parentMenuId === ''
              ? void 0
              : Number(res.info.parentMenuId)
        });
        cols.value = res.info.columns;
        tables.value = res.tables;
        initLoading.value = false;
      })
      .catch((e) => {
        console.error(e);
        EleMessage.error(e.message);
      });
  };

  /** 弹窗关闭事件 */
  const handleClosed = () => {
    resetFields();
    formRef.value?.clearValidate?.();
    validMsg.value = '';
  };

  /** 最近路径快速选择 */
  const handleDropClick = (command) => {
    if (command === 'reset') {
      form.genPath = '/';
    }
  };

  // 查询字典类型下拉数据
  listDicts()
    .then((list) => {
      dictOptions.value = list ?? [];
    })
    .catch((e) => {
      EleMessage.error(e.message);
    });
</script>

<style lang="scss" scoped>
  .form-box :deep(.el-form-item__label) {
    white-space: nowrap;
  }

  .form-box :deep(.el-divider--horizontal) {
    margin: 22px 0 28px 0;

    .el-divider__text {
      padding: 0 12px;
      font-size: 15px;
      font-weight: bold;
      background: var(--el-bg-color-overlay);
    }
  }

  /* 表单验证气泡形式 */
  .form-table :deep(table) {
    table-layout: fixed;

    .el-form-item > .el-form-item__content {
      justify-content: center;

      & > .el-form-item__error {
        position: absolute;
        left: 0;
        top: calc(0px - 100% - 6px);
        width: max-content;
        color: #fff;
        font-size: 12px;
        background: var(--el-color-danger);
        transition: all 0.2s;
        padding: 10px;
        border-radius: 4px;
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;

        &:after {
          content: '';
          border: 6px solid transparent;
          border-top-color: var(--el-color-danger);
          position: absolute;
          left: 12px;
          bottom: -11px;
        }
      }

      &:hover > .el-form-item__error {
        opacity: 1;
        visibility: visible;
        pointer-events: all;
      }
    }

    tbody > tr:first-child .el-form-item > .el-form-item__content {
      & > .el-form-item__error {
        bottom: calc(0px - 100% - 6px);
        top: auto;

        &:after {
          top: -11px;
          bottom: auto;
          border-bottom-color: var(--el-color-danger);
          border-top-color: transparent;
        }
      }
    }

    tr > td,
    tr > th {
      padding-left: 4px;
      padding-right: 4px;
      text-align: center;
    }

    .form-table-index {
      position: sticky;
      left: 0;
      z-index: 998;
    }
  }
</style>
