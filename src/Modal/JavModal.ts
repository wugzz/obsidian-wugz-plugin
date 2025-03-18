import { App, Modal } from "obsidian";
import { ICodeInfo } from "src/UI/ICodeInfo";
import PageCode, { IPageCode } from "src/UI/PageCode";

interface IProps {
	code: string;
}

export class JavModal extends Modal {
	constructor(app: App, private props: IPageCode) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.parentElement!.style.width = "700px";

		const page = new PageCode(this.app, this.props);

		contentEl.innerHTML = page.template();
		page.mount(contentEl);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
