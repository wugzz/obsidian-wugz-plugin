import UI from "src/Base/UI";
import {
	IActor,
	ICodeInfo,
	IMagnet,
	IScore,
	IVideo,
	QTType,
} from "./ICodeInfo";
import SVGConst from "./SVGConst";
import Swiper from "swiper";
import Utils from "src/utils/Utils";
import UrlConst from "src/utils/UrlConst";

import * as fs from "fs";
import { Notice } from "obsidian";
import { ImageModal } from "src/Modal/ImageModal";
import UIActor from "./UIActor";
import N8NTool, { IDownFile } from "src/utils/N8NTool";

export interface IPageCode {
	data: ICodeInfo;
	/** 进入自动加载数据 */
	load?: boolean;
	/** 是否初始化数据时回调 */
	initCall?: boolean;
	updateCodeInfo?: (code: ICodeInfo) => void;
}

export interface IFile {
	/** 名称 */
	name: string;

	oname?: string;
	/** 文件路径 */
	path: string;
	/** 文件大小 */
	size: string;
	ctime: number;
	mtime: string;
	atime: string;
	cache: string;
}

export default class PageCode extends UI<IPageCode> {
	private _data?: ICodeInfo;

	/** 是否加载数据 */
	private loading?: boolean;

	get data(): ICodeInfo {
		if (!this._data) {
			this._data = this.props.data;
			const cache = this.readJson();
			if (!cache && this.props.load) this.loading = true;
			this._data = cache ?? this._data;
			this.props.initCall && this.props.updateCodeInfo?.(this._data!);
		}
		return this._data!;
	}

	private get cover() {
		//检查是否有本地封面
		let folder = this.videoFolder;
		let name = folder + "/" + this.videoName + "-fanart.jpg";
		if (this.videoPath && fs.existsSync(name)) return Utils.localImg(name);
		name = folder + "/fanart.jpg";
		if (this.videoPath && fs.existsSync(name)) return Utils.localImg(name);

		//判断如果不是以//,http,https开头的
		const { cover } = this.data;
		if (cover && !cover.startsWith("//") && !cover.startsWith("http")) {
			return this.getResourcePath(cover) ?? cover;
		}
		//判读是否为
		return cover && Utils.proxyImg(cover!);
	}

	private get hasDownImage() {
		return !!this.cover?.startsWith("http://localhost:5678");
	}

	private readJson() {
		const { code } = this.data;

		const data = Utils.wrCode(code);

		console.log("readJson", data);
		//处理
		if (!data) return;

		//优先当前文件列表
		data.files = this.data.files;

		//处理actors
		if (!data.actors) return data;
		data.actors = data.actors.filter((actor: IActor) => !!actor);

		data.actors = data.actors.map((actor: IActor) => {
			// console.log("-----sss", Utils.wrActor(actor.name), actor);

			//优先获取本地
			return Utils.wrActor(actor.name) ?? actor;
		});

		return data;
	}

	render() {
		const data = this.data;

		console.log("render data", data);

		// if (!data.title)
		// 	return `
		// <img src="${this.cover}" alt=""  class='w-br'/>
		// ${this.renderPreview()}
		// <wie-area class='items-center'>
		//     <div>没有找到JSON数据</div>
		//     <w-desc>${this.videoPath}</w-desc>
		//     <wie-line>
		//         <wie-btn onclick='updateCode'>${
		// 			SVGConst.Refresh
		// 		}更新番号信息</wie-btn>
		//         <wie-btn onclick='open' data-path='${this.videoFolder}'>${
		// 		SVGConst.Copy
		// 	}打开视频目录</wie-btn>
		//         <a href='https://javdb.com/search?q=${
		// 			data.code
		// 		}&f=all' class='wie-btn' target="_blank" >${
		// 		SVGConst.Code
		// 	} 跳转到JavDB进行查询</a>
		//     </wie-line>
		// </wie-area>`;

		return `
        <div class='flex flex-column gap w-page-code'>
            <img src="${this.cover}" alt=""  class='w-br'/>
            <wie-area>
                <wie-title>${
					data.title ?? this.videoName ?? data.code
				}</wie-title>
                <wie-line-wrap>
                    <wie-tag onclick='copy' data-copy='${data.code}'>${
			data.code
		}</wie-tag>
                    ${data.zh ? `<wie-tag>中字</wie-tag>` : ""}
                    ${data.leak ? `<wie-tag>英字</wie-tag>` : ""}
                    ${data.und ? `<wie-tag>4K</wie-tag>` : ""}
					${!this.hasDownImage ? `<wie-tag class='red'>图片未下载</wie-tag>` : ""}
                    ${this.renderScore("JavDB", data.score)}
                    <wie-item>${SVGConst.Publish} ${
			data.releaseDate ?? "??"
		}</wie-item>
                </wie-line-wrap>
                ${this.renderFiles()}
                <wie-line-wrap>
                ${this.renderButton(
					data as any,
					"link",
					"JavDB",
					SVGConst.Detail
				)}
                <wie-btn onclick='updateCode' class='${this.loadingClass}'>${
			SVGConst.Refresh
		}更新番号信息</wie-btn>
				${this.show(
					`<wie-btn onclick='openPath' data-path='${this.videoFolder}'>${SVGConst.Copy}打开视频目录</wie-btn>`
				)}
				${this.show(
					`<wie-btn onclick='play' data-path='${this.videoPath}'>${SVGConst.Play}播放视频</wie-btn>`
				)}
				${this.show(
					` <wie-btn onclick='donwloadImages' >${SVGConst.Refresh}同步图片</wie-btn>`
				)}
       
                </wie-line-wrap>
                ${this.renderEmbyTag(data)}
            </wie-area>
            ${this.renderActors()}
            ${this.renderVideos()}
            ${this.renderTags()}
            ${this.renderSubs()}
            ${this.renderInfo()}
            ${this.renderPreview()}
            ${this.renderComment()}
            ${this.renderMangets()}
        </div>
        `;
	}

	private get loadingClass() {
		return this.loading ? "loading" : "";
	}

	private show(string: string, key: string = "localPath") {
		if (key === "localPath" && !this.videoPath) return "";

		return string;
	}

	private renderFiles() {
		const { files = [] } = this.data;
		return files
			.map((file) => {
				return `<w-desc>${file.path}</w-desc>`;
			})
			.join("");
	}

	async donwloadImages(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		if (!this.videoPath) return new Notice("没有找到视频路径");
		//如果正在加载中
		if (btn.className.indexOf("loading") > -1) return;

		btn.addClass("loading");

		const images: IDownFile[] = [];

		const { preview = [] } = this.data;

		let fail: number = 0;
		for (let i = 0; i < preview.length; i++) {
			const url = preview[i];
			const path = this.videoFolder + "/extrafanart";
			images.push({
				url,
				folder: path,
				name: "extrafanart-" + (i + 1) + ".jpg",
			});
			// let item = await Utils.download(
			// 	url,
			// 	path,
			// 	"extrafanart-" + (i + 1) + ".jpg"
			// );
			// if (!item) fail++;
		}
		//处理封面图
		let { image, cover } = this.data;
		if (cover && this.videoPath) {
			images.push({
				url: cover,
				folder: this.videoFolder!,
				name: this.videoName + "-fanart.jpg",
			});
			// let item = await Utils.download(
			// 	cover,
			// 	this.videoFolder!,
			// 	this.videoName + "-fanart.jpg"
			// );
			// if (!item) fail++;
		}
		//处理大图
		if (image && this.videoPath) {
			images.push({
				url: image,
				folder: this.videoFolder!,
				name: "image.jpg",
			});

			// let item = await Utils.download(
			// 	image,
			// 	this.videoFolder!,
			// 	"image.jpg"
			// );
			// if (!item) fail++;
		}
		// if (fail > 0) {
		// 	new Notice("下载失败" + fail + "个，请重试");
		// 	btn.removeClass("loading");
		// 	return;
		// }

		// const path = this.videoFolder + "/extrafanart";
		await N8NTool.downImages("下载图片", images);

		this.setState({});
		new Notice("下载完成");
	}

	// openPath(e: Event) {
	// 	const btn = e.currentTarget as HTMLElement;
	// 	const path = btn.getAttribute("data-path")!;
	// 	if (!path) return;
	// 	Utils.openFolder(path);
	// }

	// play(e: Event) {
	// 	const btn = e.currentTarget as HTMLElement;
	// 	const path = btn.getAttribute("data-path")!;
	// 	if (!path) return;
	// 	Utils.openFile(path);
	// }

	protected onEvent() {
		if (!this.data) return;
		const { actors = [] } = this.data;

		const act = this.view!.querySelector("#wie-actors") as HTMLElement;
		if (actors.length > 1 && act) {
			new Swiper(act, {
				spaceBetween: 10,
				slidesPerView: "auto",
				// watchSlidesProgress: true,
				pagination: {
					el: ".swiper-pagination",
				},
				centeredSlides: true,
				slideToClickedSlide: true,
			});
		}

		const pre = this.view!.querySelector("#wie-previews") as HTMLElement;

		if (pre) {
			new Swiper(
				this.view!.querySelector("#wie-previews") as HTMLElement,
				{
					spaceBetween: 10,
					slidesPerView: "auto",
					// watchSlidesProgress: true,
					pagination: {
						enabled: true,
						type: "fraction",
					},
					centeredSlides: true,
					slideToClickedSlide: true,
				}
			);
		}
	}

	openImage(e: Event) {
		let image = this.data.image;
		if (!image) return;
		if (fs.existsSync(this.videoFolder + "/image.jpg")) {
			image = Utils.localImg(this.videoFolder + "/image.jpg");
		}
		this.open(ImageModal, { image });
	}

	renderPreview() {
		let folder = this.videoFolder;

		let previews: string[] = [];

		//判断是否有图片
		try {
			folder = folder + "/extrafanart";
			const list = fs.readdirSync(folder);

			list.forEach((item) => {
				const path = folder + "/" + item;
				previews.push(Utils.localImg(path));
			});
		} catch (error) {}

		if (previews.length === 0) {
			//判断
			const { preview = [] } = this.data;
			if (preview.length > 0) {
				previews = preview.map((item) => Utils.proxyImg(item)!);
			} else return "";
		}

		return `<wie-area >
        <wie-line class='justify-between'>
        <wie-item-title>${SVGConst.Info}预览图</wie-item-title>

        ${
			this.data.image
				? `<wie-btn onclick='openImage'>${SVGConst.Delete}查看大图</wie-btn>`
				: ""
		}
        </wie-line>
        <div id='wie-previews' class='swiper-container swiper-images'>
        <div class='swiper-wrapper'>
		    ${previews
				.map(
					(p) =>
						`<div class='swiper-slide'><img src='${p}' class='w-br'/></div>`
				)
				.join("")}
                </div>
		    <div class="swiper-pagination"></div></div>
		</wie-area>`;
	}

	renderActors() {
		const { actors = [] } = this.data;

		if (actors.length === 0) return "";
		else if (actors.length === 1)
			return this.ui(UIActor, { actor: actors[0], detail: true });
		return `<div id='wie-actors' class='swiper-container'>
            <div class='swiper-wrapper'>
                ${actors
					.map(
						(actor, i) =>
							`<div class='swiper-slide'>${this.ui(UIActor, {
								actor,
								detail: true,
							})}</div>`
					)
					.join("")}
            </div>
            <div class="swiper-pagination"></div>
        </div>`;
	}

	copy(event: Event) {
		const btn = event.currentTarget as HTMLElement;
		const text = btn.getAttribute("data-copy");
		if (!text) return;
		Utils.copy(text);
		new Notice("复制成功");
	}

	async updateCode(e: Event) {
		const data = this.data;

		if (!data.code) return;

		this.loading = true;

		const btn = e.currentTarget as HTMLElement;
		//如果正在加载中
		if (btn.className.indexOf("loading") > -1) return;
		//btn
		btn.addClass("loading");

		//请求获取电影信息
		const ret = await Utils.fetch(
			UrlConst.GET_CODE_INFO + `?code=${data.code}`
		);

		if (ret) {
			Object.assign(data, ret);
			if (data.actors)
				data.actors = data.actors.map((actor: IActor) => {
					// console.log("-----sss", Utils.wrActor(actor.name), actor);
					//优先获取本地
					return Utils.wrActor(actor.name) ?? actor;
				});

			//获取字幕信息
			if (!data.subs || data.subs.length === 0) {
				const subs = await Utils.fetch(
					UrlConst.GET_SUBS_INFO + `?code=${data.code}`
				);
				if (subs) data.subs = subs;
			}

			this.updateCodeInfo();
		} else {
			new Notice("获取数据失败,请重试");
			btn.removeClass("loading");
			this.loading = false;
		}
	}

	private updateCodeInfo() {
		const data = this.data;
		Utils.wrCode(data.code, data);
		//更新
		this.props.updateCodeInfo?.(data);
		//更新actor
		this.loading = false;
		this.setState({});
	}

	async updateSubs(e: Event) {
		const data = this.data;
		const btn = e.currentTarget as HTMLElement;
		//如果正在加载中
		if (btn.className.indexOf("loading") > -1) return;
		//btn
		btn.addClass("loading");

		const subs = await Utils.fetch(
			UrlConst.GET_SUBS_INFO + `?code=${data.code}`
		);
		if (subs) {
			data.subs = subs;
			this.updateCodeInfo();
		} else {
			new Notice("查询字幕失败,请重试");
			btn.removeClass("loading");
		}
	}

	renderComment() {
		const { comment = [] } = this.data;

		return `<wie-area>
            <wie-item-title>${SVGConst.Comment}评论</wie-item-title>
            ${comment
				.map(
					(c) =>
						`<wie-comment>
                        <div class='flex item-center justify-between'>
                            <w-desc>${c.from}</w-desc>
                            <w-desc>${c.time}</w-desc>
                        </div>
                        <wie-text>${c.comment}</wie-text>
                    </wie-comment>`
				)
				.join("")}
        </wie-area>`;
	}

	renderVideos() {
		const { vs = [] } = this.data;

		return `<wie-area>
            <wie-item-title>${SVGConst.Play} 在线视频</wie-item-title>
            <wie-line-wrap>
            ${vs.map((v) => this.renderVideo(v)).join("")}
            </wie-line-wrap>
        </wie-area>`;
	}

	private renderVideo(v: IVideo) {
		const tags: string[] = [];
		if (v.sub === true) tags.push("中字");
		if (v.uhd === true) tags.push("4K");
		if (v.leak === true) tags.push("无码");
		let tagStr: string = "";
		if (tags.length > 0) tagStr = `<wie-tag>${tags.join("、")}</wie-tag>`;
		return `<a class='wie-btn ${tagStr ? "w-tag" : ""}' href='${
			v.link
		}' target='_blank'>${SVGConst.Play}${v.from}${tagStr}</a>`;
	}

	renderSubs() {
		const { subs = [] } = this.data;
		return `<wie-area>
            <wie-line class='justify-between'>
                <wie-item-title>${SVGConst.Sub}字幕</wie-item-title>
                <wie-btn onclick='updateSubs' class='${this.loadingClass}'>${
			SVGConst.Refresh
		} 重新查找字幕</wie-btn>
            </wie-line>
            <wie-line-wrap>
            ${subs
				.map(
					(s) =>
						`<wie-btn onclick='downSub' data-url='${
							s.href ?? s.url
						}' class='wie-btn-max ellipsis'>${SVGConst.Download}${
							s.name
						}</wie-btn>`
				)
				.join("")}
            </wie-line-wrap>
        </wie-area>`;
	}

	private isDown: boolean = false;

	async downSub(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		const url = btn.getAttribute("data-url");
		if (!url) return;

		const path = this.videoPath;

		if (!path) return new Notice("没有找到视频路径");

		if (this.isDown) return new Notice("正在下载中，请稍后");

		//下载字幕
		let folder = this.videoFolder!;
		let name = this.videoName + ".zh-CN.default.srt";

		//去除后缀

		let ret = await Utils.download(url, folder, name);

		if (ret) new Notice("已下载文件到目录");
		else new Notice("下载失败");

		this.isDown = false;
	}

	renderInfo() {
		const {
			series,
			desc = "--",
			director = "",
			duration = "--",
			studio = "--",
		} = this.data;
		const { url = "", name = "" } = series ?? {};
		return `<wie-area>
            <wie-item-title>${SVGConst.Info}信息</wie-item-title>
            <wie-text><w-name>剧情：</w-name> ${desc}</wie-text>
            <wie-text><w-name>导演：</w-name> ${director}</wie-text>
            <wie-text><w-name>时长：</w-name> ${duration}</wie-text>
            <wie-text><w-name>制作：</w-name> ${studio}</wie-text>
            <wie-text><w-name>系列：</w-name> <a target="_blank" class="wie-a" href='${url}'>${name}</a></wie-text>
        </wie-area>`;
	}

	renderTags() {
		return `<wie-area>
            <wie-item-title>${SVGConst.TAG}标签</wie-item-title>
            <wie-line-wrap>${
				this.data.tags
					?.map((g) => `<wie-tag>${g}</wie-tag>`)
					.join(" ") || ""
			}</wie-line-wrap>
        </wie-area>`;
	}

	renderEmbyTag(data: ICodeInfo) {
		let innerHTML = ``;
		if (data.emby) {
			innerHTML = `<img class='w-emby' url="${data.emby}"  src='https://s2.loli.net/2024/03/27/IA2x8LwqUKfDusr.png'/>`;
		} else if (data.in115) {
			innerHTML = `<img class='w-emby' url="${data.in115}" src='https://s2.loli.net/2024/02/21/LEteiTnICdzkqsU.png'/>`;
		} else if (data.qt === QTType.DOWNLOADED) {
			innerHTML = `<img class='w-emby' src='https://s2.loli.net/2024/03/27/kdXK4aEpQcq51Mt.png'/>`;
		} else if (data.qt === QTType.DOWNLOADING) {
			innerHTML = `<img class='w-emby' src='https://s2.loli.net/2024/03/27/ykt12oqBedMaNQj.png'/>`;
		} else {
			return "";
		}
		return innerHTML;
	}

	renderScore(title: string, score?: IScore) {
		if (!score) return "";
		let html = `<wie-item class='gap-0'>${SVGConst.Score}<span>${
			score.score
		}</span><span>|${title}${
			(
				typeof score.num === "number"
					? score.num > 0
					: score.num?.length > 0
			)
				? `|${score.num}人点评`
				: ""
		}</span></wie-item>`;
		return html;
	}

	renderMangets() {
		const { magnet = [] } = this.data;
		return `<wie-area>
            <wie-item-title>${SVGConst.Rank}磁力链接</wie-item-title>
            ${magnet.map((item) => this.renderMagnet(item)).join("")}
            </wie-area>`;
	}

	renderMagnet({ name, size, from, time, magnet, sub, uhd, leak }: IMagnet) {
		return `<wie-magnet>
            <div>${name}</div>
            <wie-line class='justify-between'>
                <w-desc>${size}</w-desc>
                <w-desc>${time}</w-desc>
            </wie-line>
            <wie-line class='justify-between'>
                <wie-item>
                    <wie-tag-z >${from}</wie-tag-z>
                    <wie-tag-z class='${!!sub} sub'>中文字幕</wie-tag-z>
                    <wie-tag-z class='${!!uhd} 4k'>4K</wie-tag-z>
                    <wie-tag-z class='${!!leak} leak'>无码破解</wie-tag-z>
                </wie-item>
                <wie-item>
                    <wie-btn onclick='copy' data-copy='${magnet}'>${
			SVGConst.Copy
		}复制链接</wie-btn>
                    <a href='${magnet}' class='wie-btn' target='_blank' referrerpolicy='same-origin'>${
			SVGConst.Download
		} 下载</a>
                </wie-item>
            </wie-line>
        </wie-magnet>`;
	}

	renderButton(
		actor: IActor,
		key: keyof IActor,
		name: string,
		icon: string = SVGConst.Detail,
		href?: string
	) {
		if (!actor[key]) return "";
		return `<a class='wie-btn' target='_blank' href='${
			href ?? actor[key]
		}' >${icon} ${name}</a>`;
	}

	private get videoCover() {
		return this.videoFolder + "/" + this.videoName + "-fanart.jpg";
	}

	private get videoFolder() {
		return this.videoPath?.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
	}

	private get videoName() {
		//截取文件名
		return this.videoPath
			?.replace(/\\/g, "/")
			.split("/")
			.pop()!
			.replace(/\.[^.]+$/, "");
	}

	private get videoPath() {
		return this.data.files?.[0]?.path;
	}
}
