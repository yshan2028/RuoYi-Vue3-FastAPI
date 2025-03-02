import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Compression from 'vite-plugin-compression';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { EleAdminResolver } from 'ele-admin-plus/es/utils/resolvers';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  const alias = {
    '@/': resolve('src') + '/'
  };
  const plugins = [vue()];
  if (isBuild) {
    // 组件按需引入
    plugins.push(
      Components({
        dts: false,
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          }),
          EleAdminResolver({
            importStyle: 'sass'
          })
        ]
      })
    );
    // gzip压缩
    plugins.push(
      Compression({
        disable: !isBuild,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      })
    );
  } else {
    // 开发环境全局安装
    alias['./as-needed'] = './global-import';
  }
  return {
    resolve: { alias },
    plugins,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/renderers',
        'echarts/components',
        'vue-echarts',
        'vuedraggable',
        'sortablejs'
      ]
    },
    build: {
      target: 'chrome63',
      chunkSizeWarningLimit: 2000
    },
    server: {
      host: true, // 允许外部访问
      port: 3000, // 设置默认端口为 80
      strictPort: true, // 如果 80 端口被占用，就报错而不是换其他端口
      open: true // 启动后自动打开浏览器
    }
  };
});
