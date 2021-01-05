
const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
// 创建一个Bar存放文章
const hitokotoBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

// 激活
function activate(context) {
	// 定义数据结构
	const hitokoto = {
		id: null,
		intervalTimeFlag: null
	};
	// 当ctrl+shift+p 输入时hitokoto时 都重新获取
	let disposable = vscode.commands.registerCommand('extension.hitokoto', function () {
		createHitokoto(hitokoto);
	});
	// 当ctrl+shift+p 输入时refreshHitokoto时 都重新获取
	const getText = vscode.commands.registerCommand('extension.refreshHitokoto', function () {
		createHitokoto(hitokoto);
	})
	// 将其放入context中
	context.subscriptions.push(disposable);
	context.subscriptions.push(getText)
	// 判断是否激活
	const autoStart = vscode.workspace.getConfiguration().get('hitokoto.autoStart');
	if (autoStart) createHitokoto(hitokoto);
	// 是否自动更换每日已于
	createIntervalHitokoto(hitokoto);
	// 监听配置变化
	vscode.workspace.onDidChangeConfiguration(() => {
		createIntervalHitokoto(hitokoto)
	})
}
// 配置实时更新的
function createIntervalHitokoto(hitokoto) {
	clearInterval(hitokoto.intervalTimeFlag);
	const interval = vscode.workspace.getConfiguration().get('hitokoto.intervalShow');
	if (interval) {
		const intervalTime = vscode.workspace.getConfiguration().get('hitokoto.intervalTime');
		hitokoto.intervalTimeFlag = setInterval(() => {
			createHitokoto(hitokoto)
		}, intervalTime * 1000 * 60)
	}
}
// 获取数据
function createHitokoto(hitokoto) {
	const api = vscode.workspace.getConfiguration().get('hitokoto.api');
	console.log(api);
	axios.get(api).then(res => {
		hitokoto['id'] = res.data.id;
		showHitokoto(res.data);
	}).catch((err) => {
		vscode.window.showInformationMessage('API服务连接失败')
	})
}
// 展示出来
function showHitokoto(data) {
	hitokotoBarItem.color = vscode.workspace.getConfiguration().get('hitokoto.fontColor');
	hitokotoBarItem.text = `${data.hitokoto} --- ${data.from}`;
	hitokotoBarItem.command = `extension.refreshHitokoto`;
	hitokotoBarItem.tooltip = "点击刷新";
	hitokotoBarItem.show();
}
exports.activate = activate;
// 插件被停用的时候被调用
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
