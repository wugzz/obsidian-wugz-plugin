import { Plugin } from "obsidian";
import CodeBlock from "src/Base/CodeBlock";
import Card from "src/CodeBlock/Card";
import ChanTitle from "src/CodeBlock/ChanTitle";
import Tip from "src/CodeBlock/Tip";
import Video from "src/CodeBlock/Video";
import WButton from "src/CodeBlock/WButton";
import PluginSetting from "src/PluginSetting";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	public static CodeBlocks: [string, typeof CodeBlock<any>][] = [
		["ChanTitle", ChanTitle],
		["Video", Video],
		["Card", Card],
		["Tip", Tip],
	];

	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		//初始化代码块
		this.initCodeBlocks();

		//注册设置Tab
		this.addSettingTab(new PluginSetting(this.app, this));
	}

	private initCodeBlocks() {
		for (let [name, CodeBlock] of MyPlugin.CodeBlocks) {
			this.registerMarkdownCodeBlockProcessor(name, (...args) => {
				let codeBlock: CodeBlock = new (CodeBlock as any)(this);
				codeBlock.render(...args);
			});
		}
		// this.registerMarkdownPostProcessor
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
