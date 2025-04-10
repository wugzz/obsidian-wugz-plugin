import MyPlugin from "main";
import {
	App,
	Editor,
	MarkdownPostProcessorContext,
	MarkdownView,
	Notice,
} from "obsidian";
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
	private get CodeName() {
		return this.constructor.name;
	}

	constructor(
		app: App,
		private source: string,
		protected cxt: MarkdownPostProcessorContext
	) {
		super(app, parserSource(source) as T);
		// this.plugin = plugin;
		// this.cxt = cxt;
	}

	mount(container: HTMLElement): void {
		container.insertAdjacentHTML("beforeend", this.template());
		super.mount(container);
	}

	protected oPlugin(name: string) {
		const plugins = (this.app as any).plugins.plugins;
		return plugins[name];
	}

	updateProps(props: Partial<T>) {
		let source = this.source;
		for (const [key, value] of Object.entries(props)) {
			(this.props as any)[key] = value;
			const reg = new RegExp(`(${key})\\s*.*`);
			if (source.match(reg)) {
				source = source.replace(reg, `${key} ${value}`).trim();
			} else {
				source += `\n${key} ${value}`;
			}
		}

		let oldContent = this.source;
		if (oldContent) oldContent += "\n";

		const oldBlock = `\`\`\`${this.CodeName}\n${oldContent}\`\`\``;
		const newBlock = `\`\`\`${this.CodeName}\n${source.trim()}\n\`\`\``;

		console.log(oldContent, source);

		this.updateContent([[new RegExp(oldBlock, "g"), newBlock]]);
		this.setState();
	}

	/**
	 * 当前文件路径
	 * @returns
	 */
	protected get filePath() {
		return this.localPath(this.cxt.sourcePath);
	}

	protected get rootPath() {
		return (this.app.vault.adapter as any).basePath;
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

	/**
	 * 修改当前文件名
	 */
	protected renameFile(name: string) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || !view.file) return;
		let fileName = view.file.parent?.path + "/" + name;
		this.app.vault.rename(view.file, fileName);
	}

	protected async addMeta(key: string, value: any) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || !view.file) return;
		const lines = view.editor.getValue().split("\n");
		if (lines[0] !== "---") {
			lines.unshift("---", `${key}: ${JSON.stringify(value)}`, "---", "");
		} else {
			// 查找 Frontmatter 结束行
			let endIndex = 1;
			while (endIndex < lines.length && lines[endIndex] !== "---") {
				endIndex++;
			}

			// 更新或添加键值
			let found = false;
			for (let i = 1; i < endIndex; i++) {
				if (lines[i].startsWith(`${key}:`)) {
					lines[i] = `${key}: ${JSON.stringify(value)}`;
					found = true;
					break;
				}
			}
			if (!found)
				lines.splice(endIndex, 0, `${key}: ${JSON.stringify(value)}`);
		}
		view.editor.setValue(lines.join("\n"));
	}

	protected getMeta(key: string) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || !view.file) return;
		const meta = this.app.metadataCache.getFileCache(view.file);
		console.log("meta", meta);
		if (meta?.frontmatter) {
			const value = meta.frontmatter[key];
			if (value) return value;
		}
	}

	protected updateContentByLine(
		match: RegExp,
		content:
			| string
			| ((line: number, edtior: Editor) => [i: number, text: string]),
		cursor: boolean = true
	) {
		const item = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!item) return;

		const count = item.editor.lineCount(); // 结束位置

		for (let i = 0; i < count; i++) {
			let text = item.editor.getLine(i);
			if (text.match(match)) {
				if (typeof content === "function") {
					[i, text] = content(i, item.editor);
				} else {
					text = text.replace(match, content);
				}
				item.editor.setLine(i, text);
				if (cursor) item.editor.setCursor({ line: i, ch: 0 });
				break;
			}
		}
	}

	/**
	 * 更新当前文件内容
	 * @param updates
	 * @returns
	 */
	protected updateContent(updates: [reg: RegExp, content: string][]) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const editor = view.editor;

		let value = editor.getValue(); // 获取当前 Markdown 文本

		//替换内容
		let hasChanged = false;
		for (const [reg, content] of updates) {
			if (!value.match(reg)) continue;
			// 如果匹配到正则表达式，则替换
			hasChanged = true;
			value = value.replace(reg, content);
		}
		//标签
		if (!hasChanged) return;
		let cursor = editor.getCursor(); // 获取光标位置
		editor.setValue(value); // 设置新内容
		editor.setCursor(cursor); // 恢复光标位置
	}
}
