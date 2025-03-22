import { App, Modal } from "obsidian";
import { BaseModal } from "./BaseModal";

interface IProps {
	image: string;
}

export class ImageModal extends BaseModal<IProps> {
	render(contentEl: HTMLElement) {
		contentEl.parentElement!.style.width = "auto";
		contentEl.innerHTML = `<img style='width:1000px' src="${this.props.image}" alt="" class="w-br" />`;
	}
}
