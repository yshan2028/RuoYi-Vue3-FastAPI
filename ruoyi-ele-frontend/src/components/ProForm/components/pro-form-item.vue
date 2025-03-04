<template>
  <EleText v-if="item.type === 'label'" v-bind="item.props || {}">
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
    <template
      v-if="!(item.slots && item.slots.default && $slots[item.slots.default])"
    >
      <template v-if="item.label != null && item.label !== ''">
        {{ item.label }}
      </template>
      <ProFormContent
        v-if="item.children && item.children.length"
        :model="model"
        :rules="rules"
        :items="item.children"
        :grid="item.grid"
        :rowProps="item.rowProps"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template v-for="name in Object.keys($slots)" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormContent>
    </template>
  </EleText>
  <ElDivider v-else-if="item.type === 'divider'" v-bind="item.props || {}">
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
    <template
      v-if="!(item.slots && item.slots.default && $slots[item.slots.default])"
    >
      <template v-if="item.label != null && item.label !== ''">
        {{ item.label }}
      </template>
      <ProFormContent
        v-if="item.children && item.children.length"
        :model="model"
        :rules="rules"
        :items="item.children"
        :grid="item.grid"
        :rowProps="item.rowProps"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template v-for="name in Object.keys($slots)" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormContent>
    </template>
  </ElDivider>
  <ElButton
    v-else-if="item.type === 'button'"
    type="primary"
    v-bind="item.props || {}"
  >
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
    <template
      v-if="!(item.slots && item.slots.default && $slots[item.slots.default])"
    >
      <template v-if="item.label != null && item.label !== ''">
        {{ item.label }}
      </template>
      <ProFormContent
        v-if="item.children && item.children.length"
        :model="model"
        :rules="rules"
        :items="item.children"
        :grid="item.grid"
        :rowProps="item.rowProps"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template v-for="name in Object.keys($slots)" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormContent>
    </template>
  </ElButton>
  <EleSteps
    v-else-if="item.type === 'steps'"
    :active="model[item.prop] ?? 0"
    v-bind="item.props || {}"
  >
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
  </EleSteps>
  <EleCard
    v-else-if="item.type === 'card'"
    :header="item.label"
    :bordered="true"
    v-bind="item.props || {}"
  >
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot
        :name="item.slots?.[name]"
        v-bind="slotProps || {}"
        :proForm="{
          item: item,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
    </template>
    <ProFormContent
      v-if="
        item.children &&
        item.children.length &&
        !(item.slots && item.slots.default && $slots[item.slots.default])
      "
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </EleCard>
  <EleTabs
    v-else-if="item.type === 'tabs'"
    type="border-card"
    :modelValue="
      model[item.prop] ??
      (item.children?.length ? item.children[0].prop : void 0)
    "
    v-bind="item.props || {}"
    :items="
      item.children
        ? item.children.map((c) => ({
            name: c.prop,
            label: c.label,
            slot: 'itemContent',
            meta: c
          })) || []
        : []
    "
    @update:modelValue="updateValue"
  >
    <template #itemContent="{ item: tabItem }">
      <slot
        v-if="
          tabItem.meta.slots &&
          tabItem.meta.slots.default &&
          $slots[tabItem.meta.slots.default]
        "
        :name="tabItem.meta.slots.default"
        :proForm="{
          item: tabItem,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
      <ProFormContent
        v-else-if="tabItem.meta.children && tabItem.meta.children.length"
        :model="model"
        :rules="rules"
        :items="tabItem.meta.children"
        :grid="tabItem.meta.grid"
        :rowProps="tabItem.meta.rowProps"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template v-for="name in Object.keys($slots)" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormContent>
    </template>
  </EleTabs>
  <EleTable
    v-else-if="
      item.type === 'table' ||
      (item.type === 'div' &&
        item.props?.is &&
        ['ele-table', 'EleTable'].includes(item.props.is))
    "
    v-bind="item.props ? { ...item.props, is: void 0 } : {}"
  >
    <slot
      v-if="item.slots && item.slots.default && $slots[item.slots.default]"
      :name="item.slots?.default"
      :proForm="{
        item: item,
        model: model,
        rules: rules,
        formItems: formItems,
        searchExpand: searchExpand,
        updateItemValue: updateItemValue,
        slots: $slots
      }"
    ></slot>
    <ProFormContent
      v-else-if="item.children && item.children.length"
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </EleTable>
  <ElCollapse
    v-else-if="item.type === 'collapse'"
    :modelValue="
      model[item.prop] ??
      (item.props?.accordion
        ? item.children?.length
          ? (item.children[0].props?.name ?? item.children[0].prop)
          : void 0
        : [])
    "
    v-bind="item.props || {}"
    @update:modelValue="updateValue"
  >
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot
        :name="item.slots?.[name]"
        v-bind="slotProps || {}"
        :proForm="{
          item: item,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
    </template>
    <ProFormContent
      v-if="
        item.children &&
        item.children.length &&
        !(item.slots && item.slots.default && $slots[item.slots.default])
      "
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </ElCollapse>
  <ElCollapseItem
    v-else-if="item.type === 'collapseItem'"
    :title="item.label"
    :name="item.prop"
    v-bind="item.props || {}"
  >
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot
        :name="item.slots?.[name]"
        v-bind="slotProps || {}"
        :proForm="{
          item: item,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
    </template>
    <ProFormContent
      v-if="
        item.children &&
        item.children.length &&
        !(item.slots && item.slots.default && $slots[item.slots.default])
      "
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </ElCollapseItem>
  <ElRow v-else-if="item.type === 'row'" v-bind="item.props || {}">
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot
        :name="item.slots?.[name]"
        v-bind="slotProps || {}"
        :proForm="{
          item: item,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
    </template>
    <ProFormContent
      v-if="
        item.children &&
        item.children.length &&
        !(item.slots && item.slots.default && $slots[item.slots.default])
      "
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </ElRow>
  <ElCol v-else-if="item.type === 'col'" v-bind="item.props || {}">
    <template
      v-for="name in Object.keys(item.slots || {}).filter(
        (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
      )"
      #[name]="slotProps"
    >
      <slot
        :name="item.slots?.[name]"
        v-bind="slotProps || {}"
        :proForm="{
          item: item,
          model: model,
          rules: rules,
          formItems: formItems,
          searchExpand: searchExpand,
          updateItemValue: updateItemValue,
          slots: $slots
        }"
      ></slot>
    </template>
    <ProFormContent
      v-if="
        item.children &&
        item.children.length &&
        !(item.slots && item.slots.default && $slots[item.slots.default])
      "
      :model="model"
      :rules="rules"
      :items="item.children"
      :grid="item.grid"
      :rowProps="item.rowProps"
      :formItems="formItems"
      :searchExpand="searchExpand"
      @updateItemValue="updateItemValue"
    >
      <template v-for="name in Object.keys($slots)" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProFormContent>
  </ElCol>
  <component
    v-else-if="item.type === 'div'"
    v-bind="item.props ? { ...item.props, is: void 0 } : {}"
    :is="item.props?.is || 'div'"
  >
    <template
      v-if="!(item.slots && item.slots.default && $slots[item.slots.default])"
    >
      <template v-if="item.label != null && item.label !== ''">
        {{ item.label }}
      </template>
      <ProFormContent
        v-if="item.children && item.children.length"
        :model="model"
        :rules="rules"
        :items="item.children"
        :grid="item.grid"
        :rowProps="item.rowProps"
        :formItems="formItems"
        :searchExpand="searchExpand"
        @updateItemValue="updateItemValue"
      >
        <template v-for="name in Object.keys($slots)" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </ProFormContent>
    </template>
    <slot
      v-else
      :name="item.slots?.default"
      :proForm="{
        item: item,
        model: model,
        rules: rules,
        formItems: formItems,
        searchExpand: searchExpand,
        updateItemValue: updateItemValue,
        slots: $slots
      }"
    ></slot>
  </component>
  <slot
    v-else-if="
      item.type &&
      !defaultTypes.includes(item.type) &&
      (item.itemType === 'view' || item.itemType === 'container')
    "
    :name="item.type"
    :item="item"
    :model="model"
    :updateValue="updateValue"
    :proForm="{
      item: item,
      model: model,
      rules: rules,
      formItems: formItems,
      searchExpand: searchExpand,
      updateItemValue: updateItemValue,
      slots: $slots
    }"
  ></slot>
  <ElFormItem
    v-else
    :label="item.label"
    v-bind="item.itemProps || {}"
    :prop="item.prop"
    :rules="itemRules"
  >
    <template
      v-for="name in Object.keys(item.itemSlots || {}).filter(
        (k) =>
          !!(item.itemSlots && item.itemSlots[k] && $slots[item.itemSlots[k]])
      )"
      #[name]="slotProps"
    >
      <slot :name="item.itemSlots?.[name]" v-bind="slotProps || {}"></slot>
    </template>
    <ElInput
      v-if="item.type === 'input'"
      :clearable="true"
      :placeholder="'请输入' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElInput>
    <ElInput
      v-else-if="item.type === 'textarea'"
      :rows="4"
      :placeholder="'请输入' + item.label"
      v-bind="item.props || {}"
      type="textarea"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElInput>
    <ElSelect
      v-else-if="item.type === 'select'"
      class="ele-fluid"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
      <ElOption
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </ElSelect>
    <ElSelect
      v-else-if="item.type === 'multipleSelect'"
      class="ele-fluid"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :multiple="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
      <ElOption
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </ElSelect>
    <ElRadioGroup
      v-else-if="item.type === 'radio'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <ElRadio
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :value="opt.value"
        :label="opt.label"
        :disabled="opt.disabled"
      />
    </ElRadioGroup>
    <ElRadioGroup
      v-else-if="item.type === 'radioButton'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <ElRadioButton
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :value="opt.value"
        :label="opt.label"
        :disabled="opt.disabled"
      />
    </ElRadioGroup>
    <ElCheckboxGroup
      v-else-if="item.type === 'checkbox'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <ElCheckbox
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :value="opt.value"
        :label="opt.label"
        :disabled="opt.disabled"
      />
    </ElCheckboxGroup>
    <ElCheckboxGroup
      v-else-if="item.type === 'checkboxButton'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <ElCheckboxButton
        v-for="opt in item.options || []"
        :key="opt.key ?? opt.value"
        :value="opt.value"
        :label="opt.label"
        :disabled="opt.disabled"
      />
    </ElCheckboxGroup>
    <ElDatePicker
      v-else-if="item.type === 'date'"
      valueFormat="YYYY-MM-DD"
      class="ele-fluid"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElDatePicker>
    <ElDatePicker
      v-else-if="item.type === 'datetime'"
      valueFormat="YYYY-MM-DD HH:mm:ss"
      class="ele-fluid"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      type="datetime"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElDatePicker>
    <ElDatePicker
      v-else-if="item.type === 'daterange'"
      valueFormat="YYYY-MM-DD"
      rangeSeparator="-"
      startPlaceholder="开始日期"
      endPlaceholder="结束日期"
      :unlinkPanels="true"
      class="ele-fluid"
      type="daterange"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElDatePicker>
    <ElDatePicker
      v-else-if="item.type === 'datetimerange'"
      valueFormat="YYYY-MM-DD HH:mm:ss"
      rangeSeparator="-"
      startPlaceholder="开始时间"
      endPlaceholder="结束时间"
      :unlinkPanels="true"
      class="ele-fluid"
      v-bind="item.props || {}"
      type="datetimerange"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElDatePicker>
    <ElTimePicker
      v-else-if="item.type === 'time'"
      valueFormat="HH:mm:ss"
      class="ele-fluid"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElTimePicker>
    <ElTimePicker
      v-else-if="item.type === 'timerange'"
      valueFormat="HH:mm:ss"
      rangeSeparator="-"
      startPlaceholder="开始时间"
      end-placeholder="结束时间"
      class="ele-fluid"
      v-bind="item.props || {}"
      :isRange="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElTimePicker>
    <ElTimeSelect
      v-else-if="item.type === 'timeSelect'"
      class="ele-fluid"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    />
    <ElSwitch
      v-else-if="item.type === 'switch'"
      :active-value="1"
      :inactive-value="0"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElSwitch>
    <ElInputNumber
      v-else-if="item.type === 'inputNumber'"
      class="ele-fluid"
      controls-position="right"
      :placeholder="'请输入' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElInputNumber>
    <ElAutocomplete
      v-else-if="item.type === 'autocomplete'"
      class="ele-fluid"
      :fetchSuggestions="(_keyword, callback) => callback(item.options || [])"
      :placeholder="'请输入' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElAutocomplete>
    <ElCascader
      v-else-if="item.type === 'cascader'"
      class="ele-fluid"
      :clearable="true"
      :options="item.options || []"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElCascader>
    <ElRate
      v-else-if="item.type === 'rate'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElRate>
    <ElSlider
      v-else-if="item.type === 'slider'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElSlider>
    <ElSlider
      v-else-if="item.type === 'sliderRange'"
      v-bind="item.props || {}"
      :range="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElSlider>
    <ElTreeSelect
      v-else-if="item.type === 'treeSelect'"
      class="ele-fluid"
      :clearable="true"
      :data="item.options"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElTreeSelect>
    <ElTreeSelect
      v-else-if="item.type === 'treeMultipleSelect'"
      class="ele-fluid"
      :clearable="true"
      :data="item.options"
      :placeholder="'请选择' + item.label"
      :show-checkbox="true"
      v-bind="item.props || {}"
      :multiple="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ElTreeSelect>
    <EleTreeSelect
      v-else-if="item.type === 'virtualTreeSelect'"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleTreeSelect>
    <EleTreeSelect
      v-else-if="item.type === 'virtualTreeMultipleSelect'"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      :maxTagCount="1"
      v-bind="item.props || {}"
      :multiple="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleTreeSelect>
    <EleTableSelect
      v-else-if="item.type === 'tableSelect'"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleTableSelect>
    <EleTableSelect
      v-else-if="item.type === 'tableMultipleSelect'"
      :clearable="true"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :multiple="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleTableSelect>
    <EleCheckCard
      v-else-if="item.type === 'checkCard'"
      :items="item.options"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleCheckCard>
    <EleCheckCard
      v-else-if="item.type === 'multipleCheckCard'"
      :items="item.options"
      v-bind="item.props || {}"
      :multiple="true"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleCheckCard>
    <EleEditTag
      v-else-if="item.type === 'editTag'"
      type="info"
      :style="{ marginTop: '4px' }"
      :itemStyle="{ margin: '0 4px 4px 0' }"
      :buttonStyle="{ marginBottom: '4px' }"
      :inputTagStyle="{ marginBottom: '4px' }"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleEditTag>
    <DictData
      v-else-if="item.type === 'dictRadio'"
      code=""
      v-bind="item.props || {}"
      type="radio"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </DictData>
    <DictData
      v-else-if="item.type === 'dictSelect'"
      code=""
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      type="select"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </DictData>
    <DictData
      v-else-if="item.type === 'dictCheckbox'"
      code=""
      v-bind="item.props || {}"
      type="checkbox"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </DictData>
    <DictData
      v-else-if="item.type === 'dictMultipleSelect'"
      code=""
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      type="multipleSelect"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </DictData>
    <ImageUpload
      v-else-if="item.type === 'imageUpload'"
      v-bind="item.props || {}"
      ref="imageUploadRef"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </ImageUpload>
    <FileUpload
      v-else-if="item.type === 'fileUpload'"
      v-bind="item.props || {}"
      ref="fileUploadRef"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </FileUpload>
    <RegionsSelect
      v-else-if="item.type === 'regions'"
      :placeholder="'请选择' + item.label"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </RegionsSelect>
    <TinymceEditor
      v-else-if="item.type === 'editor'"
      v-bind="item.props || {}"
      :modelValue="model[item.prop]"
      @update:modelValue="updateValue"
    >
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </TinymceEditor>
    <EleText v-else-if="item.type === 'text'" v-bind="item.props || {}">
      <template
        v-if="!(item.slots && item.slots.default && $slots[item.slots.default])"
      >
        {{ model[item.prop] }}
      </template>
      <template
        v-for="name in Object.keys(item.slots || {}).filter(
          (k) => !!(item.slots && item.slots[k] && $slots[item.slots[k]])
        )"
        #[name]="slotProps"
      >
        <slot :name="item.slots?.[name]" v-bind="slotProps || {}"></slot>
      </template>
    </EleText>
    <slot
      v-else-if="item.type"
      :name="item.type"
      :item="item"
      :model="model"
      :updateValue="updateValue"
    ></slot>
  </ElFormItem>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { ElCarousel, ElCarouselItem, ElIcon } from 'element-plus/es';
  import { EleAlert, EleAdminLayout } from 'ele-admin-plus/es';
  import TinymceEditor from '@/components/TinymceEditor/index.vue';
  import RegionsSelect from '@/components/RegionsSelect/index.vue';
  import ImageUpload from '@/components/ImageUpload/index.vue';
  import FileUpload from '@/components/FileUpload/user-details.vue';
  import {
    defaultTypes,
    uploadTypes,
    getRuleTrigger,
    getRuleMessage
  } from '../util';
  import ProFormContent from './pro-form-content.vue';

  // 用于 div 的 is
  defineOptions({
    components: {
      ElCarousel,
      ElCarouselItem,
      ElIcon,
      EleAlert,
      EleAdminLayout
    }
  });

  const props = defineProps({
    /** 表单项配置 */
    item: {
      type: Object,
      required: true
    },
    /** 表单数据 */
    model: {
      type: Object,
      required: true
    },
    /** 验证规则 */
    rules: Object,
    /** 全部的表单项 */
    formItems: Array,
    /** 搜索表单展开状态 */
    searchExpand: Boolean
  });

  const emit = defineEmits(['updateItemValue']);

  /** 更新值 */
  const updateValue = (value) => {
    if (props.item.prop != null) {
      updateItemValue(props.item.prop, value);
    }
  };

  /** 更新表单项值 */
  const updateItemValue = (prop, value) => {
    emit('updateItemValue', prop, value);
  };

  /** 图片上传组件实例 */
  const imageUploadRef = ref(null);

  /** 文件上传组件实例 */
  const fileUploadRef = ref(null);

  /** 判断上传组件是否上传完毕 */
  const uploadIsDone = () => {
    if (props.item.type === 'imageUpload') {
      return imageUploadRef.value ? imageUploadRef.value.isDone() : true;
    }
    if (props.item.type === 'fileUpload') {
      return fileUploadRef.value ? fileUploadRef.value.isDone() : true;
    }
    return true;
  };

  /** 表单验证规则 */
  const itemRules = computed(() => {
    const itemProps = props.item.itemProps;
    const iRule = itemProps ? itemProps.rules : void 0;
    const iRules = iRule ? (Array.isArray(iRule) ? iRule : [iRule]) : void 0;
    const fRule = props.rules ? props.rules[props.item.prop] : void 0;
    const fRules = fRule ? (Array.isArray(fRule) ? fRule : [fRule]) : void 0;
    const rules = iRules || fRules || [];
    const trigger = getRuleTrigger(props.item.type);
    const message = getRuleMessage(props.item.type, props.item.label);
    if (props.item.required) {
      rules.unshift({ required: true, message, trigger });
    }
    if (props.item.type && uploadTypes.includes(props.item.type)) {
      const validator = (_rule, value, callback) => {
        if (value && !uploadIsDone()) {
          return callback(new Error(`${props.item.label ?? ''}还未上传完毕`));
        }
        callback();
      };
      rules.push({ trigger, validator });
    }
    return rules;
  });
</script>
