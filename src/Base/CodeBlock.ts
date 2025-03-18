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
	constructor(
		app: App,
		prop: string,
		protected cxt: MarkdownPostProcessorContext
	) {
		super(app, parserSource(prop) as T);
		// this.plugin = plugin;
		this.cxt = cxt;
	}

	mount(container: HTMLElement): void {
		container.insertAdjacentHTML("beforeend", this.template());
		super.mount(container);
	}

	protected oPlugin(name: string) {
		const plugins = (this.app as any).plugins.plugins;
		return plugins[name];
	}

	/**
	 * 当前文件路径
	 * @returns
	 */
	protected get filePath() {
		return this.localPath(this.cxt.sourcePath);
	}

	protected get fileName() {
		return this.cxt.sourcePath.substring(
			this.cxt.sourcePath.lastIndexOf("/") + 1,
			this.cxt.sourcePath.lastIndexOf(".")
		);
	}

	/**
	 * 当前文件目录
	 * @returns
	 */
	protected get fileDir() {
		const path = this.filePath;
		return path.substring(0, path.lastIndexOf("\\"));
	}

	protected getIcon(name: string | undefined) {
		if (!name) return "";
		return (
			this.oPlugin("obsidian-icon-folder")?.api.getIconByName(name)
				?.svgElement ?? ""
		);
	}
}
