import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";
import UrlConst from "src/utils/UrlConst";
import Utils from "src/utils/Utils";

interface IProp {
	tid?: string;
	count?: string;
	day?: string;
	update?: string;

	type?: "4chan" | "localVideo";

	folder?: string;
	title?: string;
}

export default class ChanTitle extends CodeBlack<IProp> {
	render(): string {
		const { tid = "未知", count = 0, day, update } = this.props;
		return `<wie-area><wie-line style='gap:15px'>
<wie-item><w-name>ID:</w-name><wie-bold>${tid}</wie-bold></wie-item>
<wie-item><w-name>视频:</w-name><wie-bold>${count}</wie-bold></wie-item>
<wie-item><w-name>更新:</w-name><wie-bold>${
			update ?? "--"
		}</wie-bold></wie-item>

		${this.renderChanOpt()}
	${this.renderLocalVideos()}
		</wie-line>
	</wie-area>`;
	}

	renderChanOpt() {
		if (!this.isChan) return "";
		const { tid = "未知", count = 0, day } = this.props;
		return `<wie-item><a class='wie-btn' target='_blank' href='https://boards.4chan.org/gif/thread/${tid}?day=${day}&count=${count}'>4Chan</a></wie-item>
		<wie-item><a class='wie-btn' target='_blank' href='https://archived.moe/gif/thread/${tid}?day=${day}&count=${count}'>Archived</a></wie-item>
		`;
		//<wie-item><wie-btn class='loading'>${SVGConst.Refresh}检查更新中</wie-btn></wie-item>
	}

	renderLocalVideos() {
		const { type, folder, title } = this.props;

		if (type !== "localVideo" || !folder || !title) return "";

		return `<wie-btn onclick='recheck'>${SVGConst.Refresh}重新检索目录生成</wie-btn>`;
	}

	protected async recheck(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		if (btn.hasClass("loading")) return;
		btn.addClass("loading");

		const { folder, title } = this.props;

		//请求
		const ret = await Utils.fetch(
			UrlConst.CREATE_VIDEOS_MD + `?path=${folder}&title=${title}`
		);

		if (ret) {
			new Notice("生成成功");
		} else {
			new Notice("生成失败，请重试");
		}
		btn.removeClass("loading");
	}

	private get isChan() {
		const { tid = "" } = this.props;
		if (tid === "redgif" || tid === "custom") return false;
		return true;
	}

	protected onEvent(el: HTMLElement) {
		if (!this.isChan) return;

		// this.checkUpdate();
		// el.querySelector("wie-btn")?.addEventListener(
		// 	"click",
		// 	this.goUpdate.bind(this)
		// );
	}

	private isUpdate: boolean = false;

	async goUpdate(e: Event) {
		const { tid = "", day } = this.props;
		if (!tid) return;

		if (this.isUpdate) return;

		const btn = e.currentTarget as HTMLElement;
		this.isUpdate = true;
		btn.addClass("loading");
		try {
			const url = `http://localhost:5678/webhook/down4ChanDetail?thread=${tid}&day=${day}`;
			let ret = await fetch(url);
			//等待3秒
			console.log("----reee", ret);
			//修改
			if (ret.status == 200) btn.style.display = "none";
		} catch (e) {
			console.log(e);
		}
		btn.removeClass("loading");
		this.isUpdate = false;
	}

	async checkUpdate() {
		// const activeFile = app.workspace.getActiveFile();
		// const [a, b, t] = activeFile?.path.split("-");
		const { tid, count = 0, day } = this.props;

		if (!tid) return;

		//请求
		try {
			// console.log("--4Chan-检查帖子--", tid);
			let res = await fetch(
				`http://localhost:5678/webhook/getChatTheadInfo?t=${tid}`
			);
			const data = await res.json();

			console.log("--4Chan-检查帖子--", data, count);
			//如果大于当前值，则代表有更新
			const btn = this.view!.querySelector("wie-btn") as HTMLElement;

			btn.removeClass("loading");
			if (data.posts > Number(count)) {
				btn.innerHTML = `${SVGConst.Refresh} 有更新：${data.posts}`;
				btn.style.display = "flex";
			} else {
				btn.style.display = "none";
			}
		} catch (error) {
			// console.log("-4Chan-检查帖子-", error);
		}
	}
}
