<template>
  <ele-page class="workplace-page">
    <profile-card />
    <link-card ref="linkCardRef" />
    <el-row :gutter="16" ref="wrapRef">
      <el-col
        v-for="(item, index) in data"
        :key="item.name"
        :md="item.md"
        :sm="item.sm"
        :xs="item.xs"
      >
        <component
          :is="item.name"
          :title="item.title"
          @command="(command) => handleCommand(command, index)"
        />
      </el-col>
    </el-row>
    <ele-card :body-style="{ padding: 0 }">
      <div class="workplace-bottom">
        <el-link
          type="primary"
          :icon="PlusCircleOutlined"
          :underline="false"
          class="workplace-button"
          @click="add"
        >
          添加卡片
        </el-link>
        <el-divider direction="vertical" style="margin: 0" />
        <el-link
          type="primary"
          :icon="UndoOutlined"
          :underline="false"
          class="workplace-button"
          @click="reset"
        >
          重置布局
        </el-link>
      </div>
    </ele-card>
    <!-- 添加卡片弹窗 -->
    <ele-modal :width="680" v-model="visible" title="未添加的卡片">
      <el-row :gutter="16" style="margin-top: -16px">
        <el-col
          v-for="item in notAddedData"
          :key="item.name"
          :md="8"
          :sm="12"
          :xs="24"
        >
          <ele-card
            bordered
            :header="item.title"
            :header-style="{ padding: '8px 14px', fontSize: '14px' }"
            :body-style="{ padding: '32px 0', textAlign: 'center' }"
            style="margin-top: 16px"
          >
            <el-button
              plain
              round
              size="small"
              type="primary"
              @click="addView(item)"
            >
              添加
            </el-button>
          </ele-card>
        </el-col>
      </el-row>
      <el-empty
        v-if="!notAddedData.length"
        description="已添加所有视图"
        :image-size="80"
      />
    </ele-modal>
  </ele-page>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import SortableJs from 'sortablejs';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { PlusCircleOutlined, UndoOutlined } from '@/components/icons';
  import ProfileCard from './components/profile-card.vue';
  import LinkCard from './components/link-card.vue';
  import ActivitiesCard from './components/activities-card.vue';
  import TaskCard from './components/task-card.vue';
  import GoalCard from './components/goal-card.vue';
  import ProjectCard from './components/project-card.vue';
  import UserList from './components/user-list.vue';

  defineOptions({
    name: 'DashboardWorkplace',
    components: {
      ActivitiesCard,
      TaskCard,
      GoalCard,
      ProjectCard,
      UserList
    }
  });

  const CACHE_KEY = 'workplace-layout';

  /** 默认布局 */
  const DEFAULT = [
    {
      name: 'activities-card',
      title: '最新动态',
      md: 8,
      sm: 24,
      xs: 24
    },
    {
      name: 'task-card',
      title: '我的任务',
      md: 8,
      sm: 24,
      xs: 24
    },
    {
      name: 'goal-card',
      title: '本月目标',
      md: 8,
      sm: 24,
      xs: 24
    },
    {
      name: 'project-card',
      title: '项目进度',
      md: 16,
      sm: 24,
      xs: 24
    },
    {
      name: 'user-list',
      title: '小组成员',
      md: 8,
      sm: 24,
      xs: 24
    }
  ];

  /** 获取缓存的数据 */
  const getCacheData = () => {
    const str = localStorage.getItem(CACHE_KEY);
    try {
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  };

  /** 卡片数据 */
  const data = ref([...(getCacheData() ?? DEFAULT)]);

  /** 弹窗是否打开 */
  const visible = ref(false);

  /** 快捷方式卡片 */
  const linkCardRef = ref(null);

  /** 容器 */
  const wrapRef = ref(null);

  /** 拖拽排序实例 */
  let sortableIns = null;

  /** 未添加的数据 */
  const notAddedData = computed(() => {
    return DEFAULT.filter((d) => !data.value.some((t) => t.name === d.name));
  });

  /** 添加 */
  const add = () => {
    visible.value = true;
  };

  /** 重置布局 */
  const reset = () => {
    data.value = [...DEFAULT];
    cacheData();
    linkCardRef.value?.reset?.();
    EleMessage.success('已重置');
  };

  /** 缓存布局 */
  const cacheData = () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data.value));
  };

  /** 编辑卡片 */
  const handleCommand = (command, index) => {
    switch (command) {
      case 'refresh': // 刷新
        EleMessage.info({ message: '点击了刷新', plain: true });
        break;
      case 'edit': // 编辑
        EleMessage.info({ message: '点击了编辑', plain: true });
        break;
      case 'remove': // 删除
        ElMessageBox.confirm(
          `确定要删除“${data.value[index].title}”卡片吗?`,
          '系统提示',
          { type: 'warning', draggable: true }
        )
          .then(() => {
            data.value = data.value.filter((_d, i) => i !== index);
            cacheData();
          })
          .catch(() => {});
        break;
    }
  };

  /** 添加视图 */
  const addView = (item) => {
    data.value.push(item);
    cacheData();
    EleMessage.success('已添加');
  };

  onMounted(() => {
    // 卡片支持拖动排序
    if ('ontouchstart' in document.documentElement) {
      return;
    }
    sortableIns = new SortableJs(wrapRef.value?.$el, {
      handle: '.ele-card-header',
      filter: '.demo-more-icon',
      animation: 300,
      onUpdate: ({ oldIndex, newIndex }) => {
        if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
          const temp = [...data.value];
          temp.splice(newIndex, 0, temp.splice(oldIndex, 1)[0]);
          data.value = temp;
          cacheData();
        }
      },
      setData: () => {},
      forceFallback: true
    });
  });

  onBeforeUnmount(() => {
    sortableIns && sortableIns.destroy();
    sortableIns = null;
  });
</script>

<style lang="scss" scoped>
  .workplace-page {
    :deep(.ele-card-header) {
      user-select: none;
      cursor: move;
    }

    :deep(.el-col) {
      &.sortable-chosen > .ele-card {
        box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.2);
      }

      &.sortable-ghost {
        opacity: 0;
      }

      &.sortable-fallback {
        opacity: 1 !important;
      }
    }
  }

  /* 底部按钮 */
  .workplace-bottom {
    display: flex;
    align-items: center;

    .workplace-button {
      flex: 1;
      padding: 10px 0;
      transition: background-color 0.2s;

      &:hover {
        background: hsla(0, 0%, 60%, 0.05);
      }

      :deep(.el-icon) {
        font-size: 15px;
        margin: -1px 6px 0 0;
      }
    }
  }
</style>
