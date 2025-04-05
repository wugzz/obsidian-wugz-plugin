import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";

interface IProp {
	folder?: string;
	image: string;
	height?: string;
	random?: boolean;
}

export default class Banner extends CodeBlack<IProp> {
	private hasInit = false;

	private get imageFolder() {
		const { folder } = this.props;
		if (folder) return folder.replace(/\\/g, "/");
		//返回项目本地路径
		return `_system/banners`;
	}

	mount(container: HTMLElement): void {
		super.mount(container);

		container.parentElement!.addClass("wie-absolute");
	}

	private updateImage() {
		const { random, image } = this.props;
		let isTemp = this.fileDir.match(/_system\\templater/);

		if (this.hasInit || (isTemp && image) || (!isTemp && random)) return;

		const folder = this.imageFolder;

		const files = this.app.vault.getFiles().filter((file) => {
			return file.path.startsWith(folder);
		});

		if (files.length === 0) {
			this.hasInit = true;
			return;
		}
		const randomIndex = Math.floor(Math.random() * files.length);

		setTimeout(() => {
			let props: IProp = { image: files[randomIndex].path };
			if (!this.fileDir.match(/_system\\templater/)) props.random = true;
			this.updateProps(props);
		}, 1);
	}

	render() {
		const { image, height = "250px" } = this.props;

		this.updateImage();

		if (!image) return ``;

		return `<img class='wie-banner' style='height:${height}' src="${this.app.vault.adapter.getResourcePath(
			image
		)}" alt="image" />`;
	}
}
