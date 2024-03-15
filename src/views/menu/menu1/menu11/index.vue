<template>

	<div class="layout-padding layout-padding-unset layout-iframe">
		<div class="layout-padding-auto layout-padding-view">
			<div class="layout-pd">
		<el-input v-model="val" placeholder="menu11：请输入内容测试路由缓存"></el-input>
	</div>
			<iframe src="https://nodejs.org/zh-cn/" title="message.router.layoutIframeViewOne" frameborder="0" height="100%" width="100%"></iframe>
		</div>
	</div>
</template>

<script setup lang="ts" name="menu11">
import { ref } from 'vue';
import p1 from "/@/assets/login-bg.svg";
import p2 from "/@/assets/login-icon-two.svg";
console.log(p1)
   console.log(p2)
// 定义变量内容
const val = ref('');
</script>
