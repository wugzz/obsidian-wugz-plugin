import { App, Modal } from "obsidian";
import PageActor, { IPageActor } from "src/UI/PageActor";

export class BaseModal<T> extends Modal {
	protected width: string = "700px";

	constructor(app: App, public props: T) {
		super(app);
	}

	render(content: HTMLElement) {}

	onOpen() {
		const { contentEl } = this;
		contentEl.parentElement!.style.width = this.width;
		this.render(contentEl);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
