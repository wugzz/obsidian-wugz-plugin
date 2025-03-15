import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";
import { MarkdownView } from "obsidian";

interface IProp {
	name: string;

	url: string;

	cachePath: string;

	updateH: boolean;
}

export default class Video extends CodeBlack<IProp> {
	renderTemplate(): string {
		const { url } = this.props;

		let path = this.getResourcePath(url);
		return `<video controls="" class='w-video' preload="metadata" src="${path}" ></video>`;
	}

	protected bindEvent(el: HTMLElement): void {
		const video = el.querySelector("video")!;
		video.volume = 0.2;
		video.addEventListener(
			"ended",
			this.videoEnded.bind(this, video, true, true)
		);

		//检查是否已经播放过
		setTimeout(() => {
			this.checkCache(video);
		}, 1);
	}

	private async checkCache(video: HTMLVideoElement) {
		const exists = fs.existsSync(this.cachePath());

		if (exists) this.videoEnded(video, false);
	}

	videoEnded(video: HTMLVideoElement, write: boolean, uH: boolean = true) {
		video.addClass("w-video-read");

		//添加本地缓存
		if (write) fs.writeFileSync(this.cachePath(), "1");

		const item = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!item) return console.log("-videoEnded-", "没有找到MarkdownView");

		const content = item.editor.getValue();

		const { url } = this.props;

		let reg = new RegExp(`${url}-已播放`, "g");

		if (content.match(reg)) return;

		const index = content.match(url)?.index;

		if (index === undefined) return;

		const count = item.editor.lineCount(); // 结束位置

		for (let i = 0; i < count; i++) {
			let text = item.editor.getLine(i);
			if (text && text.startsWith("##") && text.match(url)) {
				item.editor.setLine(i, text.replace(url, `${url}-已播放`));
				item.editor.setCursor({ line: i, ch: 0 });
				break;
			}
		}
	}

	private cachePath() {
		const { url } = this.props;
		if (!url) return "";
		const [name] = url.split(".");
		return `${this.cacheFolder()}${name}`;
	}

	private cacheFolder() {
		return (
			this.props.cachePath ?? "I:\\videox\\note\\Movie\\4Chan\\.read\\"
		);
	}

	async writeFile(name: string) {}
}
