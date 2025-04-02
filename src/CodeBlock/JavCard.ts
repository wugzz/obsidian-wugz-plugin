import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import { JavModal } from "src/Modal/JavModal";
import { ICodeInfo } from "src/UI/ICodeInfo";
import SVGConst from "src/UI/SVGConst";
import Utils from "src/utils/Utils";

interface IProp {
	rank: string;
	lastRank: string;
	title: string;
	code: string;
	cover: string;
	score: string;
	releaseDate: string;
	link: string;
	num: string;
}

export default class JavCard extends CodeBlack<IProp> {
	private _data: ICodeInfo;

	private get cover() {
		//判断如果不是以//,http,https开头的
		const { cover } = this.info;
		if (cover && !cover.startsWith("//") && !cover.startsWith("http")) {
			return this.getResourcePath(cover) ?? cover;
		}
		//判读是否为
		return cover && Utils.proxyImg(cover!);
	}

	private get info() {
		if (!this._data) {
			const {
				code,
				title,
				score = 0,
				num = 0,
				releaseDate,
				link,
				cover,
			} = this.props;
			this._data = {
				code,
				title,
				score: { score: Number(score), num, total: 10 },
				releaseDate,
				link,
				cover,
			};
			if (this._data.code) {
				this._data = Utils.wrCode(this._data.code) ?? this._data;
			}
		}

		return this._data;
	}

	render(): string {
		//读取缓存文件
		const data = this.props;
		let { code, title, score, releaseDate, link } = this.info;
		const level = Number(data.rank) - Number(data.lastRank);
		const rate = score?.score ?? data.score;
		return `
		<wie-area style='padding:0;gap:0;'>
		<img src="${this.cover}" alt=""  />
		<wie-area>
			<wie-title style='font-size: 16px;'>
			${data.rank}.${title}
			</wie-title>
			<wie-line-wrap>
				${data.lastRank === "0" ? `${SVGConst.New}` : ``}
				${
					data.lastRank !== "0" && level < 0
						? `<wie-item class='wie-red'>${
								SVGConst.Up
						  }<wie-bold>${-level}</wie-bold></wie-item>`
						: ""
				}
				${
					data.lastRank !== "0" && level > 0
						? `<wie-item class='wie-green'>${SVGConst.Down}<wie-bold>${level}</wie-bold></wie-item>`
						: ""
				}
				<wie-tag onclick='copy' data-copy='${code}'>${code}</wie-tag>
				${this.renderScore("JavDB", rate, score?.num ?? data.num)}
				<wie-item>${SVGConst.Publish} ${releaseDate}</wie-item>
				<a class='wie-btn' target='_blank' href='${link}' >${SVGConst.Detail}JavDB</a>
		<wie-btn onclick='openJav'>${SVGConst.Detail} 详情</wie-btn>
			</wie-line-wrap>
			${Number(rate) >= 9 ? `<wie-stamp>${SVGConst.HighRate}</wie-stamp>` : ``}
		</wie-area>
		</wie-area>
        `;
	}

	openJav() {
		new JavModal(this.app, {
			data: this.info,
			initCall: true,
			updateCodeInfo: this.updateCodeInfo.bind(this),
		}).open();
	}

	copy(event: Event) {
		const btn = event.currentTarget as HTMLElement;
		const text = btn.getAttribute("data-copy");
		if (!text) return;
		Utils.copy(text);
		new Notice("复制成功");
	}

	renderScore(
		title: string,
		score: string | number,
		num: string | number
	): string {
		if (!score) return "";
		let html = `<wie-item class='gap-0'>${
			SVGConst.Score
		}<span>${score}</span><span>|${title}${
			(typeof num === "number" ? num > 0 : num.length > 0)
				? `|${num}人点评`
				: ""
		}</span></wie-item>`;
		return html;
	}

	protected updateCodeInfo(info: ICodeInfo) {
		console.log("updateCodeInfo", info);
		this._data = info;
		this.setState();
	}
}
