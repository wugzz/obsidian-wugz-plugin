import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";
import { MarkdownView } from "obsidian";
import SVGConst from "src/UI/SVGConst";
import Utils from "src/utils/Utils";

interface IProp {
	name: string;

	url: string;

	cachePath: string;

	updateH: boolean;

	view?: string;

	path?: string;
}

export default class Video extends CodeBlack<IProp> {
	render(): string {
		let { url, view, path } = this.props;

		// let localPath = this.getResourcePath(url);

		if (!path) {
			path = `I:\\videox\\note\\Movie\\4Chan\\.videos\\${url}`;
		}

		// let videoPath = this.getLocalPath(url);
		// //如果为项目路径
		// if (videoPath) {
		// 	if (!path) path = this.localPath(videoPath);
		// 	// videoPath = this.app.vault.adapter.getResourcePath(videoPath);
		// }
		// //本地代理路径
		let videoPath = this.toLocalPath(path || url);

		return this.renderLocal(videoPath, path!);

		// if (!localPath && path) return this.renderLocal();
		return `<wie-video>
			<video controls="" class='w-video' preload="metadata" src="${videoPath}" ></video>
			<wie-tags>
				${view ? `<wie-tag-n>${SVGConst.Play}${view}</wie-tag-n>` : ""}
			</wie-tags>
		</wie-video>`;
	}

	renderLocal(video: string, path: string) {
		// const { name, path } = this.props;
		// if (!path) return "";
		const { view } = this.props;

		const folder = path.substring(0, path.lastIndexOf("\\"));
		return `<wie-area style='padding:0;gap:0;'>
			<video controls="" class='w-video' style='border-radius:0px' preload="metadata" src="${video}" ></video>
			<wie-line style='padding:15px'>
				<wie-btn onclick='play' data-path='${path}'>${SVGConst.Play}本地播放</wie-btn>
				<wie-btn onclick='openPath' data-path='${folder}'>${
			SVGConst.Detail
		}打开目录</wie-btn>
			</wie-line>
			<wie-tags>
				${view ? `<wie-tag-n>${SVGConst.Play}${view}</wie-tag-n>` : ""}
			</wie-tags>
		</wie-area>`;
	}

	protected onEvent(el: HTMLElement): void {
		const video = el.querySelector("video")!;
		if (!video) return;
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

		this.view
			?.querySelector("wie-tags")
			?.insertAdjacentHTML(
				"beforeend",
				`<wie-tag-n>${SVGConst.Collect}</wie-tag-n>`
			);

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
