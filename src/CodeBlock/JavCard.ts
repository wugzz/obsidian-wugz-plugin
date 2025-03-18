import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import { JavModal } from "src/Modal/JavModal";
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
	render(): string {
		//读取缓存文件
		const data = this.props;
		const level = Number(data.rank) - Number(data.lastRank);
		return `
		<wie-area style='padding:0;gap:0;'>
		<img src="${this.getResourcePath(data.cover)}" alt=""  />
		<wie-area>
			<wie-title style='font-size: 16px;'>
			${data.rank}.${data.title}
			</wie-title>
			<wie-line-wrap>
				${data.lastRank === "0" ? `${SVGConst.New}` : ``}
				${
					level < 0
						? `<wie-item class='wie-red'>${
								SVGConst.Up
						  }<wie-bold>${-level}</wie-bold></wie-item>`
						: ""
				}
				${
					level > 0
						? `<wie-item class='wie-green'>${SVGConst.Down}<wie-bold>${level}</wie-bold></wie-item>`
						: ""
				}
				<wie-tag onclick='copy' data-copy='${data.code}'>${data.code}</wie-tag>
				${this.renderScore("JavDB", data.score, data.num)}
				<wie-item>${SVGConst.Publish} ${data.releaseDate}</wie-item>
				<a class='wie-btn' target='_blank' href='${data.link}' >${
			SVGConst.Detail
		}JavDB</a>
		<wie-btn onclick='open'>${SVGConst.Detail} 详情</wie-btn>
			</wie-line-wrap>
			${Number(data.score) >= 9 ? `<wie-stamp>${SVGConst.HighRate}</wie-stamp>` : ``}
		</wie-area>
		</wie-area>
        `;
	}

	open() {
		const { code, title, score, num, releaseDate, link, cover } =
			this.props;
		new JavModal(this.app, {
			data: {
				code,
				title,
				score: { score: Number(score), num, total: 10 },
				releaseDate,
				link,
				cover,
			},
		}).open();
	}

	copy(event: Event) {
		const btn = event.currentTarget as HTMLElement;
		const text = btn.getAttribute("data-copy");
		if (!text) return;
		Utils.copy(text);
		new Notice("复制成功");
	}

	renderScore(title: string, score: string, num: string): string {
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
}
