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

	/**光看次数 */
	view?: string;

	/** 类型 */
	type?: string;

	/** 时长 */
	duration?: string;

	/** 发布时间 */
	time?: string;

	path?: string;

	ext?: string;

	size?: string;
}

export default class Video extends CodeBlack<IProp> {
	private isViewed: boolean = false;

	render(): string {
		let { url, view, path } = this.props;

		// let localPath = this.getResourcePath(url);

		if (!path) {
			path = `I:\\videox\\note\\Movie\\4Chan\\.videos\\${url}`;
		}

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

		return `<video controls="" class='w-video' style='border-radius:8px 8px 0 0' preload="metadata" src="${video}" poster="${poster}">
			</video>`;
	}

	renderLocal(video: string, path: string) {
		const folder = path.substring(0, path.lastIndexOf("\\"));
		return `<wie-area style='padding:0;gap:0;'>
			${this.renderVideo(video)}
			<wie-column style='padding:15px'>
				${this.renderInfo()}
				<wie-line >
					<wie-btn onclick='play' data-path='${path}'>${SVGConst.Play}本地播放</wie-btn>
					<wie-btn onclick='openPath' data-path='${folder}'>${
			SVGConst.Detail
		}打开目录</wie-btn>
					<wie-btn onclick='ai' >${SVGConst.Refresh}AI标签分析</wie-btn>
					<wie-btn onclick='viewed' >${SVGConst.Play}切换已播放状态</wie-btn>
				</wie-line>
			</wie-column>
		</wie-area>`;
	}

	renderInfo() {
		const { name, view, type, duration, time, size } = this.props;
		if (!type) return "";

		return `<wie-line >
			${this.renderItem("类型", type)}
			${this.renderItem("观看次数", view)}
			${this.renderItem("时长", duration)}
			${this.renderItem("发布时间", time)}
			${this.renderItem("大小", size)}
		</wie-line>`;
	}

	private renderItem(name: string, value?: string) {
		if (!value) return "";
		return `<wie-item><w-desc>${name}:</w-desc><div >${value}</div></wie-item>`;
	}

	protected async ai(el: Event) {
		const btn = el.currentTarget as HTMLElement;
		if (!this.btnToLoading(btn)) return;

		const { name } = this.props;

		const res = await N8NTool.AITag(name);

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
		this.checkIsRead(video);
	}

	private async checkIsRead(video: HTMLVideoElement) {
		this.isViewed = await Utils.isView(this.videoName);
		if (this.isViewed) this.videoEnded(video, false);
	}

	viewed() {
		const video = this.view?.querySelector("video") as HTMLVideoElement;
		//如果为已播放
		if (this.isViewed) return this.videoToUnread(video);
		this.videoEnded(video, true);
	}

	videoToUnread(video: HTMLVideoElement) {
		video.removeClass("w-video-read");
		this.view?.querySelector("wie-tags")?.remove();
		// 删除已读记录
		Utils.viewDelete(this.videoName);
		this.isViewed = false;
		// fs.unlinkSync(this.cachePath());
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
		// if (write) fs.writeFileSync(this.cachePath(), "1");
		if (write) Utils.viewed(this.videoName);

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
				if (write) item.editor.setCursor({ line: i, ch: 0 });
				break;
			}
		}
	}

	private get videoName() {
		let { url, path: fileName } = this.props;
		url = url || fileName!;
		if (!url) return "";
		const name = path.basename(url).replace(path.extname(url), "");
		return name;
	}
}
