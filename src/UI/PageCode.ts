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
import Actor from "./Actor";
import Swiper from "swiper";
import Utils from "src/utils/Utils";
import UrlConst from "src/utils/UrlConst";

import * as fs from "fs";
import GFriends from "src/utils/GFriends";
import { Notice } from "obsidian";

interface IProp {
	data: ICodeInfo;
	cover?: string;
	code: string;
	path: string;
}

export default class PageCode extends UI<IProp> {
	private get data() {
		return this.props.data;
	}

	render() {
		const { data, cover, code } = this.props;

		console.log("render data", data);

		if (!data.title)
			return `
        <img src="${cover}" alt=""  class='w-br'/>
        <wie-area class='items-center'>
            <div>没有找到JSON数据</div>
            <wie-line>
                <wie-btn onclick='updateCode'>${SVGConst.Refresh}更新番号信息</wie-btn>
                <a href='https://javdb.com/search?q=${code}&f=all' class='wie-btn' target="_blank" >${SVGConst.Code} 跳转到JavDB进行查询</a>
            </wie-line>
        </wie-area>`;

		return `
        <div class='flex flex-column gap w-page-code'>
            <img src="${cover ?? data.cover}" alt=""  class='w-br'/>
            <wie-area>
                <wie-title>${data.title}</wie-title>
                <wie-line-wrap>
                    <wie-tag onclick='copy' data-copy='${data.code}'>${
			data.code
		}</wie-tag>
                    ${data.zh ? `<wie-tag>中字</wie-tag>` : ""}
                    ${data.leak ? `<wie-tag>英字</wie-tag>` : ""}
                    ${data.und ? `<wie-tag>4K</wie-tag>` : ""}
                    ${this.renderScore("JavDB", data.score)}
                    <wie-item>${SVGConst.Publish} ${data.releaseDate}</wie-item>
                    
                </wie-line-wrap>
                <wie-line-wrap>
                ${this.renderButton(
					data as any,
					"link",
					"JavDB",
					SVGConst.Detail
				)}
                <wie-btn onclick='updateCode'>${
					SVGConst.Refresh
				}更新番号信息</wie-btn>
                <wie-btn onclick='open' data-path='${this.videoFolder}'>${
			SVGConst.Copy
		}打开视频目录</wie-btn>
        <wie-btn onclick='play' data-path='${this.props.path}'>${
			SVGConst.Play
		}播放视频</wie-btn>
                </wie-line-wrap>
                ${this.renderEmbyTag(data)}
            </wie-area>

            ${this.renderActors()}
            ${this.renderVideos()}
            ${this.renderTags()}
            ${this.renderSubs()}
            ${this.renderInfo()}
            ${this.renderComment()}
            ${this.renderMangets()}
        </div>
        `;
	}

	open(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		const path = btn.getAttribute("data-path")!;
		if (!path) return;
		Utils.openFolder(path);
	}

	play(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		const path = btn.getAttribute("data-path")!;
		if (!path) return;
		Utils.openFile(path);
	}

	protected onEvent() {
		if (!this.data) return;
		const { actors = [] } = this.data;

		if (actors.length <= 0) return;
		new Swiper(this.$el!.querySelector("#wie-actors") as HTMLElement, {
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

	renderActors() {
		const { actors = [] } = this.data;

		if (actors.length === 0) return "";
		else if (actors.length === 1) return this.renderActor(actors[0]);
		return `<div id='wie-actors' class='swiper-container'>
            <div class='swiper-wrapper'>
                ${actors
					.map(
						(actor, i) =>
							`<div class='swiper-slide'>${this.renderActor(
								actor,
								i
							)}</div>`
					)
					.join("")}
            </div>
            <div class="swiper-pagination"></div>
        </div>`;
	}

	public renderActor(actor: IActor, index: number = 0) {
		//是否收藏

		return `<wie-card>
        <img src='${actor.cover}' class='wie-img-mask'></img>
        <wie-card-info>
            <wie-avatar><img src='${actor.avatar}'/></wie-avatar>
            <div class='name'>${actor.name}</div>
            <div class='wie-actor-line left'>
                ${
					actor.birthday
						? `<span>${actor.birthday} ${
								actor.age ?? Actor.calcAge(actor.birthday)
						  }</span>`
						: ""
				}
                ${actor.height ? `<span>${actor.height}cm</span>` : "--"}
                <span>${actor.blood ?? ""}</span>
            </div>

            <div class='wie-actor-line left'><wie-sname>罩杯：</wie-sname><span >${Actor.renderCup(
				actor.cup
			)}</span></div>
             <div class='flex justify-between item-center'>
                ${this.renderLine("样貌", actor.rating?.looks)}
                ${this.renderLine("身材", actor.rating?.body)}
                ${this.renderLine("魅力", actor.rating?.charm)}
                ${this.renderLine("实用", actor.rating?.usefulness)}
                ${this.renderLine("综合", actor.rating?.overall)}
            </div>
            <div class='flex justify-between item-center'>
                ${this.renderItem(actor, "bust", "胸围")}
                ${this.renderItem(actor, "hip", "臀围")}
                ${this.renderItem(actor, "waist", "腰围")}
               ${this.renderItem(actor, "birthplace", "出身地")}
                ${this.renderItem(actor, "tags", "标签")}
            </div>
            ${
				actor.alias && actor.alias.length > 0
					? `<div class='wie-actor-line item-start'><wie-sname>别名：</wie-sname><span >${actor.alias.map(
							(item) => item.split(" ")[0]
					  )}</span></div>`
					: ""
			}
            <div class='flex gap flex-wrap item-center'>
                ${this.renderItem(actor, "hobby", "爱好")}
                ${this.renderItem(actor, "debut_period", "生涯")}
            </div>
            ${
				actor.first
					? `<div class='wie-actor-line item-start'><wie-sname>出道作品：</wie-sname><span >${actor.first}</span></div>`
					: ""
			}

            <wie-line>
             <wie-btn onclick='updateActor' index='${index}'>${
			SVGConst.Refresh
		} 更新信息</wie-btn>
            ${this.renderButton(
				actor,
				"link",
				"JavDB",
				SVGConst.Detail,
				`https://javdb369.com/search?q=${actor.name}&f=actor`
			)}
            ${this.renderButton(
				actor,
				"name",
				"Miss",
				SVGConst.Search,
				`https://missav.ai/actresses/${actor.name}?sort=views`
			)}
           
            ${this.renderButton(actor, "link_m", "Msin")}
            ${this.renderButton(actor, "emby", "Emby", SVGConst.Search)}
            ${this.renderButton(actor, "twitter", "SNS")}
            ${this.renderButton(actor, "officialSite", "官网")}
            </wie-line>
        </wie-card-info>
    </wie-card>`;
	}

	copy(event: Event) {
		const btn = event.currentTarget as HTMLElement;
		const text = btn.getAttribute("data-copy");
		if (!text) return;
		Utils.copy(text);
		new Notice("复制成功");
	}

	async updateActor(e: Event) {
		const { actors = [] } = this.data;
		const btn = e.currentTarget as HTMLElement;
		//如果正在加载中
		if (btn.className.indexOf("loading") > -1) return;

		const index = btn.getAttribute("index");

		const actor = actors[index as any];

		//btn
		btn.addClass("loading");

		//同步大图
		if (!actor.cover)
			actor.cover = await GFriends.Instance().getActor(actor.name);

		const ret = await Utils.fetch(
			UrlConst.GET_ACTOR_INFO + `?name=${actor.name}`
		);

		btn.removeClass("loading");

		if (ret) {
			Object.assign(actor, ret);

			Utils.wrActor(actor.name, actor);
			this.setState({});
		}
	}

	async updateCode(e: Event) {
		const data = this.data ?? {};

		if (!data.code) data.code = this.props.code;

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
		}
	}

	private updateCodeInfo() {
		const data = this.data;
		Utils.wrCode(data.code, data);
		//更新actor
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
                <wie-btn onclick='updateSubs'>${
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

		const path = this.props.path;

		if (!path) return;

		if (this.isDown) return new Notice("正在下载中，请稍后");

		//下载字幕
		let folder = this.videoFolder;
		let name = this.videoName + ".zh-CN.default.srt";

		//去除后缀

		let ret = await Utils.download(url, folder, name);

		if (ret) new Notice("已下载文件到目录");
		else new Notice("下载失败");

		this.isDown = false;
	}

	renderInfo() {
		const { series, desc = "--" } = this.data;
		const { url = "", name = "" } = series ?? {};
		return `<wie-area>
            <wie-item-title>${SVGConst.Info}信息</wie-item-title>
            <wie-text><w-name>剧情：</w-name> ${desc}</wie-text>
            <wie-text><w-name>导演：</w-name> ${this.data.director}</wie-text>
            <wie-text><w-name>时长：</w-name> ${this.data.duration}</wie-text>
            <wie-text><w-name>制作：</w-name> ${this.data.studio}</wie-text>
            <wie-text><w-name>系列：</w-name> <a target="_blank" class="wie-a" href='${url}'>${name}</a></wie-text>
        </wie-area>`;
	}

	renderTags() {
		return `<wie-area>
            <wie-item-title>${SVGConst.TAG}标签</wie-item-title>
            <wie-line-wrap>${this.data.tags
				?.map((g) => `<wie-tag>${g}</wie-tag>`)
				.join(" ")}</wie-line-wrap>
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
		if (!score) return;
		let html = `<wie-item class='gap-0'>${SVGConst.Score}<span>${
			score.score
		}</span><span>|${title}${
			(
				typeof score.num === "number"
					? score.num > 0
					: score.num.length > 0
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

	renderItem(
		actor: IActor,
		key: keyof IActor,
		name: string,
		value?: string | string[]
	) {
		if (!actor[key]) return "";

		return this.renderLine(name, value ?? actor[key]);
	}

	renderLine(name: string, value?: string) {
		if (!value) return "";
		return `<wie-item>
            <w-desc>${name}：</w-desc>
            <div class='wie-actor-line'>${value}</div>
        </wie-item>`;
	}

	private get videoCover() {
		return this.videoFolder + "/" + this.videoName + "-fanart.jpg";
	}

	private get videoFolder() {
		const { path } = this.props;
		return path.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
	}

	private get videoName() {
		const { path } = this.props;
		//截取文件名
		return path
			.replace(/\\/g, "/")
			.split("/")
			.pop()!
			.replace(/\.[^.]+$/, "");
	}
}
