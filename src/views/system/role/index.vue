
<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入角色名称" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddRole('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增角色
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="exportExcel">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					导出
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="exportExcelSelcet(state.tableData.data)">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					选择导出
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="exportPdf">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					导出PDF
				</el-button>
			</div>
				<el-table id="exportData" :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column  type="index" label="序号" width="60" />
				<el-table-column   label="角色1" show-overflow-tooltip>
						<el-table-column prop="roleName" label="角色名称" show-overflow-tooltip />
					</el-table-column>
					<el-table-column label="角色2" align="center">
				<el-table-column  prop="roleSign" label="角色标识" show-overflow-tooltip></el-table-column>
				<el-table-column prop="sort" label="排序" show-overflow-tooltip></el-table-column>
				<el-table-column  prop="status" label="角色状态" show-overflow-tooltip>
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">启用</el-tag>
						<el-tag type="info" v-else>禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="describe" label="角色描述" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
					<el-table-column  class-name="noexport"  label="操作" width="100">
					<template #default="scope">
						<el-button   :disabled="scope.row.roleName === '超级管理员'" size="small" text type="primary" @click="onOpenEditRole('edit', scope.row)"
							>修改</el-button
						>
						<el-button  :disabled="scope.row.roleName === '超级管理员'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
					
				</el-table-column>
			</el-table-column>
			</el-table>
			<el-pagination
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
				class="mt15"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				v-model:current-page="state.tableData.param.pageNum"
				background
				v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="state.tableData.total"
			>
			</el-pagination>
		</div>
		<RoleDialog ref="roleDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
// import Mock from 'mockjs';
import * as XLSX from "xlsx";
import * as XLSXStyle from "xlsx-style-vite";
import FileSaver from "file-saver";
import  downloadPDF  from "/@/utils/htmltoPdf";
// import * as FileSaver from 'file-saver';
// 引入组件
const RoleDialog = defineAsyncComponent(() => import('/@/views/system/role/dialog.vue'));

// 定义变量内容
const roleDialogRef = ref();
const state = reactive<SysRoleState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});
//mock 生成模拟数据方法
// const getData = (limit: number) => {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			const Random = Mock.Random;
// 			const data = new Array(limit).fill('').map((_, index) => {
// 				return {
// 					id: `200820-${index}`,
// 					uerName: Random.cname(),
// 					url: Random.url('http'),
// 					price: Random.float(0, 110000, 0, 2),
// 					createAt: Random.datetime('yyyy-MM-dd HH:mm:ss')
// 				}
// 			})
// 			resolve(data)
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }
const exportPdf=()=>{
	// console.log(1111)
	downloadPDF.downloadPDF(document.getElementById("exportData"),"数据")
	//
}
const exportExcelSelcet=(list:any)=>{
	let tableData=[
		['序号','角色名称','角色标识','状态','创建时间'],
	]
	list.forEach((item:any,index:number)=> {
		let rowData=[];
		rowData=[
			index+1,
			item.roleName,
			item.roleSign,
			item.status==true?'启用':'停止',
			item.createTime,

	]
	tableData.push(rowData)	
	});
	let ws=XLSX.utils.aoa_to_sheet(tableData);
	let wb=XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb,ws,'来访记录')
	XLSX.writeFile(wb,'来访记录.xlsx')

}
const exportExcel = () => {
	// let elt = document.getElementById('exportData')!.cloneNode(true)as HTMLElement;
	// console.log(elt)
	// if(elt.getElementsByClassName('noexport')!=null){
	// 	console.log(elt.getElementsByClassName('noexport').length)
	// 	while(elt.getElementsByClassName('noexport')!.length>0) {
	// 	let charr=elt.getElementsByClassName('noexport')!
	// 	console.log(charr)
	// 	for(let i=0;i<charr.length;i++){
	// 		console.log(charr[i])
	// 		if(charr[i]!=null){
	// 			console.log(charr[i])
	// 			charr[i]=null
	// 			// charr[i].parentNode.parentNode.parentNode!.removeChild(charr[i].parentNode.parentNode)
	// 		}
	// 	}
		
	// }

	// }
	exportExcelTo('exportData', '测试', '导出',2)
}
  const remove=(selectors:any)=>{
	selectors.removeNode=[]
	if(selectors.length!=undefined){
		let len=selectors.length;
		for(var i=0;i<len;i++){
			console.log(selectors[i])
			selectors.removeNode.push({
				parent:selectors[i].parentNode,
				inner:selectors[i]
			})
		}
		for(let i=0;i<len;i++){
			selectors[i].remove()
		}
	}else{
		selectors.removeNode.push({
			parent:selectors.parentNode,
			inner:selectors
		})
		selectors.remove()
	}
  }
  const recover=(selectors:any)=>{
	let len=selectors.removeNode.length;
	for(let i=0;i<len;i++){
		let node=selectors.removeNode[i];
		node.parent.appendChild(node.inner)
	}
  }
const exportExcelTo = (id:any, sheetName:any, fileName:any, titleNum=2) => {
	console.log(state.tableData.total)
	let fix=document.querySelectorAll('.noexport')
	console.log(fix)
	remove(fix)
	let wb = XLSX.utils.table_to_book(document.getElementById(id), { sheet: sheetName, raw: true })
	let range = XLSX.utils.decode_range(wb.Sheets[sheetName]['!ref'])
	let borderStyle = {  //单元格外侧框线
		top: {
			style: 'thin',
			color: { rgb: '000000' }
		},
		bottom: {
			style: 'thin',
			color: { rgb: '000000' }
		},
		left: {
			style: 'thin',
			color: { rgb: '000000' }
		},
		right: {
			style: 'thin',
			color: { rgb: '000000' }
		}
	};
	let cWidth = []
	for (let C = range.s.c; C <= range.e.c; ++C) {//sheet列
		let len = 100;//默认列宽
		let len_max = 400;//最大列宽
		for (let R = range.s.r; R <= range.e.r; R++) {//sheet行
			let cell = { c: C, r: R };//二维 列行确定一个单元格
			let cell_ref = XLSX.utils.encode_cell(cell);//单元格A1 A2
			if (wb.Sheets[sheetName][cell_ref]) {
				if (R < titleNum) {
					wb.Sheets[sheetName][cell_ref].s = {
						font: {
							sz: 15,
							color: { rgb: '060b0e' },
							bold: true
						},
						alignment: {
							horizontal: 'center',
							vertical: 'center'
						},
						fill: {
							fgColor: { rgb: 'e4e4e4' }
						},
						border: borderStyle,
						
					}
				} else {
					wb.Sheets[sheetName][cell_ref].s = {
						alignment: {
							horizontal: 'left',
							vertical: 'center'
						},
						border: borderStyle
					};
				}
				let va = JSON.parse(JSON.stringify(wb.Sheets[sheetName][cell_ref].v))
				let card11=''
				var card1 = JSON.parse(JSON.stringify(va)).match('[\u4E00-\u9FA5]');//匹配中文
				if(card1){
					card11=card1.join('')
				}
				let card2 = JSON.parse(JSON.stringify(va)).replace('[^\u0000 - \u00FF]', '')//剔除中文
				let st = 0;
				if (card11) {
					st += card11.length * 20
				}
				if (card2) {
					st += card2.length * 10
				}
				if (st > len) {
					len = st
				}
			}
		}
		if(len>len_max){
			len=len_max
		}
		cWidth.push({'wpx':len})
	}
	wb.Sheets[sheetName]['!cols'] = cWidth
	let wopts = { bookType: 'xlsx', bookSST: 'false', type: 'binary' }
	let wb_out = XLSXStyle.write(wb, wopts)
     recover(fix)
	try {
		FileSaver.saveAs(new Blob([s2ab(wb_out)], {
			type: 'application/octet-stream'
		}), `${fileName}.xlsx`);   // 导出的文件名
	} catch (e) {
		console.log(e, wb_out);
	}
	return wb_out;
}
const s2ab = (s: string) => {
	let buf = new ArrayBuffer(s.length);
	let view = new Uint8Array(buf);
	for (let i = 0; i != s.length; ++i) {

		view[i] = s.charCodeAt(i) & 0xff
	}
	return buf;
}
// const exportCsv = async (total: any, size: number,) => {
// 	try {
// 		console.log(total)
// 		if (!total) return;
// 		const step = Math.floor(total / size);
// 		let cvsArray =[];
// 		cvsArray.push(['编号', '用户名', '官网', '报价', '创建日期'])
// 		cvsArray.join() + '\n';
// 		for (let i = 0; i < step; i++) {
// 			await new Promise(async (resolve, reject) => {
// 				try {
// 					const data: any = state.tableData.data
// 					const csv = data.map((row: any) => {
// 						cvsArray.push(Object.values(row).join() + '\n')
// 					})
// 					const process = (i / step) * 100;
// 					console.log(`进度${Math.round(process)}%`)
// 					await new Promise(resolve => {
// 						setTimeout(() => {
// 							resolve(true)
// 						}, 50)
// 					})
// 					resolve(true)
// 				} catch (error) {
// 					reject(error)
// 				}
// 			})
// 		}
// 		const blod = new Blob([String.fromCharCode(0xfeff), ...cvsArray], {
// 			type: 'text/plain;charset=utf-8'
// 		})
// 		await FileSaver.saveAs(blod, 'file.csv')
// 		return true
// 	} catch (err) {
// 		console.log(err)
// 	}
// };
// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	const data = [];
	for (let i = 0; i < 20; i++) {
		data.push({
			roleName: i === 0 ? '超级管理员' : '普通用户',
			roleSign: i === 0 ? 'admin' : 'common',
			describe: `测试角色${i + 1}`,
			sort: i,
			status: true,
			createTime: new Date().toLocaleString(),
		});
	}
	state.tableData.data = data;
	state.tableData.total = state.tableData.data.length;
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开新增角色弹窗
const onOpenAddRole = (type: string) => {
	roleDialogRef.value.openDialog(type);
};
// 打开修改角色弹窗
const onOpenEditRole = (type: string, row: Object) => {
	roleDialogRef.value.openDialog(type, row);
};
// 删除角色
const onRowDel = (row: RowRoleType) => {
	ElMessageBox.confirm(`此操作将永久删除角色名称：“${row.roleName}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			getTableData();
			ElMessage.success('删除成功');
		})
		.catch(() => { });
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};
// 页面加载时
onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.system-role-container {
	.system-role-padding {
		padding: 15px;
		.el-table {
			flex: 1;
		}
	}
}
</style>
