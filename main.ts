import { App, Component, MarkdownRenderChild, Notice, Plugin } from "obsidian";
import CodeBlock from "src/Base/CodeBlock";
import Banner from "src/CodeBlock/Banner";
import Card from "src/CodeBlock/Card";
import ChanTitle from "src/CodeBlock/ChanTitle";
import Copy from "src/CodeBlock/Copy";
import FindVideo from "src/CodeBlock/FindVideo";
import Image from "src/CodeBlock/Image";
import JavCard from "src/CodeBlock/JavCard";
import JavDashboard from "src/CodeBlock/JavDashboard";
import JavVideo from "src/CodeBlock/JavVideo";
import Read from "src/CodeBlock/Read";
import Tip from "src/CodeBlock/Tip";
import Url from "src/CodeBlock/Url";
import Video from "src/CodeBlock/Video";
import PluginSetting from "src/PluginSetting";
import { MediaServer } from "src/Server/MediaServer";

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
		["JavVideo", JavVideo],
		["JavDashboard", JavDashboard],
		["JavCard", JavCard],
		["FindVideo", FindVideo],
		["Image", Image],
		["Url", Url],
		["Copy", Copy],
		["Banner", Banner],
		["Read", Read],
	];

	settings: MyPluginSettings;

	private server: MediaServer;

	private serverRunning: boolean = false;

	public static App: App;

	async onload() {
		await this.loadSettings();

		MyPlugin.App = this.app;

		//注册组件
		// WCard.register("w-card");
		this.initServer();

		//初始化代码块
		this.initCodeBlocks();

		//注册设置Tab
		this.addSettingTab(new PluginSetting(this.app, this));
	}

	private initServer() {
		//判读是否笔记名为Movie,才启动服务
		if (this.app.vault.getName() !== "Movie") return;
		console.log("Starting server...");
		this.server = new MediaServer(1234);
		try {
			this.server.startServer();
			this.serverRunning = true;
		} catch (error) {
			new Notice(`Failed to start server: ${error.message}`);
			this.serverRunning = false;
		}
	}

	private initCodeBlocks() {
		for (let [name, CodeBlock] of MyPlugin.CodeBlocks) {
			this.registerMarkdownCodeBlockProcessor(name, (source, el, ctx) => {
				let codeBlock: CodeBlock = new (CodeBlock as any)(
					this.app,
					source,
					ctx
				);
				codeBlock.mount(el);

				const comp = new MyCodeBlockChild(el);
				comp.onunload = () => {
					// console.log("-----卸载了--", name, codeBlock);
					codeBlock.unmount();
				};
				ctx.addChild(comp);
				// return () => {
				// 	console.log("-----卸载了--", name, codeBlock);
				// 	codeBlock.unmount();
				// };
			});
		}
		// this.registerMarkdownPostProcessor
	}

	onunload() {
		this.server.stopServer();
	}

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

class MyCodeBlockChild extends MarkdownRenderChild {
	constructor(containerEl: HTMLElement) {
		super(containerEl);
	}

	onload() {}

	onunload() {}
}
