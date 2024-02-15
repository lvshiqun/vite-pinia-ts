import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus';
import viteCompression from 'vite-plugin-compression';
import { buildConfig } from './src/utils/build';

const pathResolve = (dir: string) => {
	return resolve(__dirname, '.', dir);
};

const alias: Record<string, string> = {
	'/@': pathResolve('./src/'),
	'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
};

const viteConfig = defineConfig((mode: ConfigEnv) => {
	const env = loadEnv(mode.mode, process.cwd());
	return {
		// 需要用到的插件数组
		plugins: [vue(), vueSetupExtend(), viteCompression(), JSON.parse(env.VITE_OPEN_CDN) ? buildConfig.cdn() : null],
		//// 项目根目录（index.html 文件所在的位置）,
		root: process.cwd(),
		//// 文件系统路径别名
		resolve: { alias },
		//开发或生产环境服务的公共基础路径 配置引入相对路径
		base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		//  optimizeDeps: {
		// 	entries: [], // 指定自定义条目——该值需要遵循 fast-glob 模式
		// 	exclude: [], // 在预构建中强制排除的依赖项
		// 	include: [], // 可强制预构建链接的包
		// 	keepNames: false, // true 可以在函数和类上保留 name 属性
		//   }
		optimizeDeps: { exclude: ['vue-demi'] },
		server: {
			host: '0.0.0.0',// 指定服务器应该监听哪个 IP 地址
			port: env.VITE_PORT as unknown as number,// 指定开发服务器端口
			open: JSON.parse(env.VITE_OPEN),// 启动时自动在浏览器中打开应用程序
			hmr: true, // 禁用或配置 HMR 连接
			proxy: {// 配置自定义代理规则
				'/gitee': {
					target: 'https://gitee.com',
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/gitee/, ''),
				},
			},
		},
		build: {
			outDir: 'dist',// 指定输出路径
			chunkSizeWarningLimit: 1500, // chunk 大小警告的限制
			rollupOptions: {// 自定义底层的 Rollup 打包配置
				output: {
					chunkFileNames: 'assets/js/[name]-[hash].js',
					entryFileNames: 'assets/js/[name]-[hash].js',
					assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
					manualChunks(id) {
						if (id.includes('node_modules')) {
							return id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^\/]*)\//)?.groups!.moduleName ?? 'vender';
						}
					},
				},
				...(JSON.parse(env.VITE_OPEN_CDN) ? { external: buildConfig.external } : {}),
			},
		},
		// preprocessorOptions:   css的预处理器选项
		css: { preprocessorOptions: { css: { charset: false } } },
		define: {
			__VUE_I18N_LEGACY_API__: JSON.stringify(false),
			__VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
			__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
			__NEXT_VERSION__: JSON.stringify(process.env.npm_package_version),
			__NEXT_NAME__: JSON.stringify(process.env.npm_package_name),
		},
	};
});

export default viteConfig;
