import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";

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
		const path = this.cachePath();
		const exists = fs.existsSync(this.cachePath());

		// console.log("checkCache", path, exists);
		if (exists) this.videoEnded(video, false);
	}

	videoEnded(video: HTMLVideoElement, write: boolean, uH: boolean = true) {
		video.addClass("w-video-read");

		//添加本地缓存
		if (write) fs.writeFileSync(this.cachePath(), "1");

		const { updateH = true } = this.props;

		if (!updateH || !uH) return;

		// 查找前一个标题元素
		let prevElem: any = video.parentElement?.parentElement;
		while (prevElem) {
			if (prevElem.className.match(/el-h2|el-h3|el-h4|HyperMD-header/))
				break;
			// console.log("prevElem", prevElem, prevElem.className.matches("HyperMD-header"));
			prevElem = prevElem.previousElementSibling;
		}

		//如果标题已经修改过，不再修改
		// console.log("prevElem", video, prevElem);

		// if (prevElem) {
		// 	const text = prevElem?.textContent;
		// 	if (text.match("已播放")) return;
		// 	// prevElem = prevElem.querySelector(
		// 	// 	"h2, h3, h4, .cm-header-2, .cm-header-3, .cm-header-4"
		// 	// );
		// }
		if (!prevElem) return;

		const text = prevElem?.textContent;
		if (text.match("已播放")) return;

		if (prevElem.querySelector("h2,h3,h4")) return;

		prevElem
			.querySelector(".cm-header")
			.insertAdjacentHTML("beforeend", "-已播放");
		//修改标题
		// prevElem.insertAdjacentHTML("beforeend", "-已播放");
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
