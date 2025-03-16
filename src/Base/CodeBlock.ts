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
