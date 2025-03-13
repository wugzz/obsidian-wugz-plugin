import MyPlugin from "main";
import { MarkdownPostProcessorContext, Notice } from "obsidian";

interface IProp {
	name: string;
	type: string;
	args: string[];
}

export default abstract class CodeBlack<T = any> {
	protected plugin: MyPlugin;

	protected props: T = {} as T;

	protected view: HTMLElement;

	constructor(plugin: MyPlugin) {
		this.plugin = plugin;
	}

	abstract renderTemplate(): string;

	private parserSource(source: string) {
		//解析source
		const lines = source.split("\n");
		for (let line of lines) {
			const [name, type] = line.split(" ");
			(this.props as any)[name] = type;
		}
	}

	render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		this.view = el;

		this.parserSource(source);

		el.insertAdjacentHTML("beforeend", this.renderTemplate());
		//绑定事件
		this.bindEvent(el);
	}

	// protected getElementById(id:string) {
	//    return this.view.getElementById(id);
	// }

	protected bindEvent(el: HTMLElement) {}

	protected get app() {
		return this.plugin.app;
	}

	protected getResourcePath(fileName: string): string | null {
		// 获取 Obsidian 当前 Vault 中的所有文件

		const files = this.app.vault.getFiles();
		// 遍历所有文件，查找匹配的文件名
		for (const file of files) {
			if (file.name === fileName) {
				return this.app.vault.adapter.getResourcePath(file.path); // 返回文件的完整路径
			}
		}

		return null; // 如果未找到匹配的文件，返回 null
	}

	protected oPlugin(name: string) {
		const plugins = (this.app as any).plugins.plugins;
		return plugins[name];
	}

	protected getIcon(name: string | undefined) {
		if (!name) return "";
		return (
			this.oPlugin("obsidian-icon-folder")?.api.getIconByName(name)
				?.svgElement ?? ""
		);
	}
}
