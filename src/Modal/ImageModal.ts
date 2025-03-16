import { App, Modal } from "obsidian";

interface IProps {
	image: string;
}

export class ImageModal extends Modal {
	constructor(app: App, private props: IProps) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.parentElement!.style.width = "auto";
		contentEl.innerHTML = `<img style='width:1000px' src="${this.props.image}" alt="" class="w-br" />`;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
