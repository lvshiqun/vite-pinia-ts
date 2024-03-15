import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import {visualizer} from 'rollup-plugin-visualizer'
//ue3的setup语法糖是个好东西，但使用setup语法带来的第一个问题就是无法自定义name，而我们使用keep-alive往往是需要name的
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus';
//压缩优化插件
import viteCompression from 'vite-plugin-compression';
//引入cdn处理模块
import { buildConfig } from './src/utils/build';


import fs from 'node:fs'
//自定义插件
const Myplugin = (limit = 9096) => {
	return {
		//插件名字
		name: 'my-plugin',
		//该插件是否在 plugin-vue插件之前
		enforce: 'pre',
		//代码转译 
		async transform(code, id) {
			// id是各个文件的绝对路径
			if (process.env.NODE_ENV !== 'development') {
				return
			}//endsWith  判断字符串是不是以后缀结尾的    字符串的方法
			if (!id.endsWith('.svg')) {
				return
			}
			const start = await fs.promises.stat(id)
			if (start.size > limit) {
				return
			} else {
				const buffer = await fs.promises.readFile(id)
				const base64 = buffer.toString('base64')
				const dataurl = `data:image/png;base64,${base64}`
				return {
					code: `export default "${dataurl}"`
				}
				console.log(dataurl)
			}
			// console.log(id.endsWith('.svg'),start)
		}
	}
}
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
		plugins: [vue(), vueSetupExtend(), viteCompression(
			{
				//记录压缩文件及压缩率
				verbose:true,
				//是否压缩  默认为false
				disable:false,
				//10kb以上的文件压缩   指定压缩文件的条件
				threshold:10240,
				//压缩算法  "gzip"|"brotliCompress"|"deflate"|"deflateRow"
				algorithm:'gzip',
				//压缩后文件的格式
				ext:'.gz'
			}
		),
		//打包可视化
		visualizer({
        emitFile:false,
		filename:'analysis-chart.html',
		open:true
		}),
		JSON.parse(env.VITE_OPEN_CDN) ? buildConfig.cdn() : null, Myplugin()],
		//// 项目根目录（index.html 文件所在的位置）,
		root: process.cwd(),
		//// 文件系统路径别名
		resolve: { alias },
		//开发或生产环境服务的公共基础路径 配置引入相对路径
		// base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		base: mode.command === 'serve' ? './' : './',
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
					target: '',
					ws: true,
					changeOrigin: true,
					// rewrite: (path) => path.replace(/^\/gitee/, ''),
				},
			},
		},
		build: {
			outDir: 'dist',// 指定输出路径
			chunkSizeWarningLimit: 1500, // chunk 大小警告的限制
			// vite 图片默认优化 大小低于4kb的转为base64  图片优化 如果生产环境图片地址是base64 而 开发环境是url格式
			//怎么做到统一
			//1   将assetsInlineLimit设置为0  都是url格式
			//2 将本地的url改为base64   得自己写一个插件 在plugins 写因为是开发环境

			assetsInlineLimit: 4096,
			rollupOptions: {// 自定义底层的 Rollup 打包配置
				output: {
					//分包优化
					//在UMD构建模式下为这些外部化的依赖提供的全局变量   固定写法
					// chunkFileNames: 'assets/js/[name]-[hash].js',
					entryFileNames: 'assets/js/[name]-[hash].js',
					assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
					manualChunks(id) {
						if (id.includes('node_modules')) {
							return id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^\/]*)\//)?.groups!.moduleName ?? 'vender';
						}
					},
				},//
				...(JSON.parse(env.VITE_OPEN_CDN) ? { external: buildConfig.external } : {}),
			},
		},
		//preprocessorOptions:   css的预处理器选项
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
