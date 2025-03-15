import { App } from "obsidian";

interface IProps {
	[key: string]: any;
}

export default abstract class UI<T = any, S = any> {
	protected $el: HTMLElement | null;

	protected state: S = {} as any;

	private id: string;

	constructor(private app: App, readonly props: T = {} as any) {
		this.$el = null;
		this.id = "w" + Math.random().toString(36).substring(7);
	}

	setState(newState: S) {
		this.state = { ...this.state, ...newState };
		this.update();
	}

	mount(container: HTMLElement) {
		this.$el = container.querySelector(`#${this.id}`)!;
		this.$el.innerHTML = this.render();
		this.bindEvents();
		this.mountChildren();
		this.onMount();
	}

	protected async onMount() {}

	protected onEvent(view: HTMLElement) {}

	template(): string {
		return `<div id='${this.id}'></div>`;
	}

	unmount() {
		if (this.$el) {
			this.$el.remove();
			this.$el = null;
		}
	}

	private update() {
		if (this.$el) {
			this.$el.innerHTML = this.render();
			this.bindEvents();
			this.mountChildren();
		}
	}

	private bindEvents() {
		if (!this.$el) return;
		this.$el.querySelectorAll("[onclick]").forEach((el: HTMLDivElement) => {
			const methodName = el.getAttribute("onclick");
			if (methodName && typeof (this as any)[methodName] === "function") {
				el.onclick = (this as any)[methodName].bind(this);
			}
		});
		this.onEvent(this.$el);
	}

	private mountChildren() {
		if (!this.$el) return;
		this.$el.querySelectorAll("[data-component]").forEach((el) => {
			const componentName = el.getAttribute("data-component");
			if (componentName && (this as any)[componentName] instanceof UI) {
				(this as any)[componentName].mount(el);
			}
		});
	}

	abstract render(): string;
}
