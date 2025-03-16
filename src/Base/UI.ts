import { App } from "obsidian";
import * as path from "path";

type GC<T = unknown> = new (...args: any[]) => T;

export default abstract class UI<T = any, S = any> {
	protected view: HTMLElement | null;

	protected state: S = {} as any;

	private id: string;

	protected uis: Set<UI<any>> = new Set();

	private isMount: boolean = false;

	constructor(protected app: App, readonly props: T = {} as any) {
		this.view = null;
		this.id = "w" + Math.random().toString(36).substring(7);
	}

	setState(newState: S) {
		this.state = { ...this.state, ...newState };
		if (this.isMount) this.update();
	}

	mount(container: HTMLElement) {
		this.view = container.querySelector(`#${this.id}`)!;
		this.view.innerHTML = this.render();
		this.bindEvents();
		this.mountChildren();
		//挂载子组件
		this.uis.forEach((ui) => ui.mount(this.view!));
		this.onMount();
		this.isMount = true;
	}

	protected async onMount() {}

	protected onEvent(view: HTMLElement) {}

	template(): string {
		return `<div id='${this.id}'></div>`;
	}

	unmount() {
		if (this.view) {
			this.view.remove();
			this.view = null;
		}
	}

	private update() {
		if (this.view) {
			this.view.innerHTML = this.render();
			this.bindEvents();
			this.mountChildren();
		}
	}

	private bindEvents() {
		if (!this.view) return;
		this.view
			.querySelectorAll("[onclick]")
			.forEach((el: HTMLDivElement) => {
				const methodName = el.getAttribute("onclick");
				if (
					methodName &&
					typeof (this as any)[methodName] === "function"
				) {
					el.onclick = (this as any)[methodName].bind(this);
				}
			});
		this.onEvent(this.view);
	}

	private mountChildren() {
		if (!this.view) return;
		this.view.querySelectorAll("[data-component]").forEach((el) => {
			const componentName = el.getAttribute("data-component");
			if (componentName && (this as any)[componentName] instanceof UI) {
				(this as any)[componentName].mount(el);
			}
		});
	}

	abstract render(): string;

	protected ui<T extends UI>(UI: GC<T>, props: T["props"]) {
		const ui = new UI(this.app, props);
		this.uis.add(ui);
		return ui.template();
	}

	protected getResourcePath(fileName: string): string | null {
		let path = this.getLocalPath(fileName);
		return path ? this.app.vault.adapter.getResourcePath(path) : null;
	}

	protected localPath(filePath: string): string {
		const basePath = (this.app.vault.adapter as any).basePath;
		return path.resolve(basePath, filePath);
	}

	protected getLocalPath(fileName: string): string | null {
		const files = this.app.vault.getFiles();
		// 遍历所有文件，查找匹配的文件名
		for (const file of files) {
			if (file.name === fileName) {
				console.log("file.path", file);
				return file.path; // 返回文件的完整路径
			}
		}
		return null; // 如果未找到匹配的文件，返回 null
	}
}
