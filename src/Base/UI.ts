import { App, Modal } from "obsidian";
import * as path from "path";
import { BaseModal } from "src/Modal/BaseModal";
import Utils from "src/utils/Utils";
import * as fs from "fs";
import { StringifyOptions } from "querystring";

type GC<T = unknown> = new (...args: any[]) => T;

export default abstract class UI<T = any, S = any> {
	protected view: HTMLElement | null;

	protected state: S = {} as any;

	private id: string;

	protected uis: Set<UI<any>> = new Set();
	protected uisMap: Map<string, UI<any>> = new Map();

	private isMount: boolean = false;

	constructor(protected app: App, readonly props: T = {} as any) {
		this.view = null;
		this.id = "w" + Math.random().toString(36).substring(7);
	}

	setState(newState: S = {} as any, update: boolean = true) {
		this.state = { ...this.state, ...newState };
		if (this.isMount && update) this.update();
	}

	mount(container: HTMLElement) {
		this.view = container.querySelector(`#${this.id}`)!;
		this.view.innerHTML = this.render();
		this.bindEvents();
		this.mountChildren();
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
			//清空子组件
			this.uis.forEach((ui) => ui.unmount());
			this.uis.clear();
			this.view.innerHTML = this.render();
			this.bindEvents();
			this.mountChildren();
		}
	}

	protected bindEvents(view: HTMLElement | null = this.view) {
		if (!view) return;
		view.querySelectorAll("[onclick]").forEach((el: HTMLDivElement) => {
			const methodName = el.getAttribute("onclick");
			if (methodName && typeof (this as any)[methodName] === "function") {
				el.onclick = (this as any)[methodName].bind(this);
			}
		});
		if (this.view === view) this.onEvent(this.view);
	}

	private mountChildren() {
		if (!this.view) return;
		//挂载子组件
		this.uis.forEach((ui) => ui.mount(this.view!));
		this.view.querySelectorAll("[data-component]").forEach((el) => {
			const componentName = el.getAttribute("data-component");
			if (componentName && (this as any)[componentName] instanceof UI) {
				(this as any)[componentName].mount(el);
			}
		});
	}

	abstract render(): string;

	protected ui<T extends UI>(UI: GC<T>, props?: T["props"], id?: string) {
		const ui = new UI(this.app, props);
		this.uis.add(ui);
		if (id) this.uisMap.set(id, ui);
		return ui.template();
	}

	protected getUI(id: string) {
		return this.uisMap.get(id);
	}

	protected open<T extends BaseModal<any>>(UI: GC<T>, props: T["props"]) {
		const modal = new UI(this.app, props);
		modal.open();
		return modal;
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
				return file.path; // 返回文件的完整路径
			}
		}
		return null; // 如果未找到匹配的文件，返回 null
	}

	openPath(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		const path = btn.getAttribute("data-path")!;
		if (!path) return;
		Utils.openFolder(path);
	}

	play(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		const path = btn.getAttribute("data-path")!;
		if (!path) return;
		Utils.openFile(path);
	}

	exist(path: string): boolean {
		return fs.existsSync(path);
	}

	protected toLocalPath(path: string): string {
		return "http://127.0.0.1:1234/?q=" + encodeURIComponent(path);
	}

	protected btnToLoading(e: Event | HTMLElement) {
		const btn =
			e instanceof HTMLElement ? e : (e.currentTarget as HTMLElement);

		if (btn.classList.contains("loading")) return false;
		btn.addClass("loading");
		return true;
	}

	protected btnToNormal(btn: HTMLElement) {
		btn?.removeClass("loading");
	}

	protected checkRender(v: any, content: string) {
		if (Array.isArray(v) ? v.length === 0 : !v) return "";
		else return content;
	}
}
