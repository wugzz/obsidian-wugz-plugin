import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";
import { MarkdownView } from "obsidian";
import SVGConst from "src/UI/SVGConst";
import Utils from "src/utils/Utils";
import * as path from "path";
import N8NTool from "src/utils/N8NTool";

interface IProp {
	name: string;

	url: string;

	cachePath: string;

	updateH: boolean;

	view?: string;

	path?: string;

	ext?: string;
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
	}

	renderVideo(video: string) {
		const { view, path: filePath } = this.props;

		// console.log("--path--", filePath, path.extname(filePath!));
		//检查是否包含图片
		let poster = "";
		if (filePath) {
			const ext = path.extname(filePath!);
			poster = filePath!.replace(ext, "-poster.jpg");
			if (fs.existsSync(poster)) {
				poster = Utils.localImg(poster);
			} else poster = "";
		}

		// let poster = Utils.localImg(filePath!.replace(ext, "-poster.jpg"));
		// if (ext === ".ts") {
		// }
		return `<video controls="" class='w-video' style='border-radius:0px' preload="metadata" src="${video}" poster="${poster}">
			</video>`;
	}

	renderLocal(video: string, path: string) {
		// const { name, path } = this.props;
		// if (!path) return "";
		const { view } = this.props;

		const isRead = this.isRead;

		const folder = path.substring(0, path.lastIndexOf("\\"));
		return `<wie-area style='padding:0;gap:0;'>
			${this.renderVideo(video)}
			<wie-line style='padding:15px'>
				<wie-btn onclick='play' data-path='${path}'>${SVGConst.Play}本地播放</wie-btn>
				<wie-btn onclick='openPath' data-path='${folder}'>${
			SVGConst.Detail
		}打开目录</wie-btn>
				<wie-btn onclick='ai' >${SVGConst.Refresh}AI标签分析</wie-btn>
				<wie-btn onclick='viewed' >${SVGConst.Play}切换已播放状态</wie-btn>
			</wie-line>
			
		</wie-area>`;

		// <wie-tags>
		// 		${isRead ? `<wie-tag-n>${SVGConst.Refresh}${view}</wie-tag-n>` : ""}
		// 	</wie-tags>
	}

	protected async ai(el: Event) {
		const btn = el.currentTarget as HTMLElement;
		if (!this.btnToLoading(btn)) return;

		const { name } = this.props;

		console.log("--ai--", name);

		const res = await N8NTool.AITag(name);

		console.log("--ai-ret-", res, res.tags);

		const item = this.app.workspace.getActiveViewOfType(MarkdownView)!;

		const count = item.editor.lineCount(); // 结束位置

		for (let i = 0; i < count; i++) {
			let text = item.editor.getLine(i);
			if (text && text.startsWith("##") && text.match(name)) {
				// item.editor.setLine(i, text.replace(url, `${url}-已播放`));
				// item.editor.setCursor({ line: i, ch: 0 });
				let line = item.editor.getLine(i + 2);
				const newTags = this.mergeTags(line, res.tags);
				const tags = newTags.map((v) => `#${v}`).join(" ");
				item.editor.setLine(i + 2, line + " " + tags);
				item.editor.setCursor({ line: i + 2, ch: 0 });
				break;
			}
		}

		this.btnToNormal(btn);
	}

	private mergeTags(tagStr: string, tags: string[]) {
		let old = tagStr.split(" ").map((v) => v.trim().replace(/#/, ""));
		let oldSet = new Set(old);

		return tags.filter((v) => !oldSet.has(v));
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

	viewed() {
		const video = this.view?.querySelector("video") as HTMLVideoElement;
		//如果为已播放
		if (this.isRead) return this.videoToUnread(video);
		this.videoEnded(video, true);
	}

	private get isRead() {
		return fs.existsSync(this.cachePath());
	}

	videoToUnread(video: HTMLVideoElement) {
		video.removeClass("w-video-read");
		this.view?.querySelector("wie-tags")?.remove();
		fs.unlinkSync(this.cachePath());
	}

	videoEnded(video: HTMLVideoElement, write: boolean) {
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

		let { url, name } = this.props;
		url = url || name;

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
		let { url, path: fileName } = this.props;
		url = url || fileName!;
		if (!url) return "";
		const name = path.basename(url).replace(path.extname(url), "");

		return `${this.cacheFolder()}${name}`;
	}

	private cacheFolder() {
		return (
			this.props.cachePath ?? "I:\\videox\\note\\Movie\\4Chan\\.read\\"
		);
	}
}
