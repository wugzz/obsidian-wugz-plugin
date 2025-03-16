import MyPlugin from "main";
import { App, MarkdownPostProcessorContext, Notice } from "obsidian";
import UI from "./UI";

type GC<T = unknown> = new (...args: any[]) => T;

interface IProp {
	name: string;
	type: string;
	args: string[];
}

const parserSource = (source: string) => {
	//解析source
	const lines = source.split("\n");
	const props: any = {};
	for (let line of lines) {
		const [name, ...other] = line.split(" ");
		props[name] = other.join(" ");
	}
	return props;
};

export default abstract class CodeBlack<T = any> extends UI<T> {
	constructor(app: App, prop: string) {
		super(app, parserSource(prop) as T);
		// this.plugin = plugin;
	}

	mount(container: HTMLElement): void {
		container.insertAdjacentHTML("beforeend", this.template());
		super.mount(container);
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
