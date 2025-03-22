import { App, Modal } from "obsidian";
import { ICodeInfo } from "src/UI/ICodeInfo";
import PageCode, { IPageCode } from "src/UI/PageCode";
import { BaseModal } from "./BaseModal";

export class JavModal extends BaseModal<IPageCode> {
	render(contentEl: HTMLElement) {
		const page = new PageCode(this.app, this.props);
		contentEl.innerHTML = page.template();
		page.mount(contentEl);
	}
}
