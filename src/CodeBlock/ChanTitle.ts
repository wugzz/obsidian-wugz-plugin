import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";

interface IProp {
	tid?: string;
	count?: string;
	day?: string;
	update?: string;
}

export default class ChanTitle extends CodeBlack<IProp> {
	render(): string {
		const { tid = "未知", count = 0, day, update } = this.props;
		return `<wie-area><wie-line style='gap:15px'>
<wie-item><w-name>ID:</w-name><wie-bold>${tid}</wie-bold></wie-item>
<wie-item><w-name>图片:</w-name><wie-bold>${count}</wie-bold></wie-item>
<wie-item><w-name>更新:</w-name><wie-bold>${
			update ?? "--"
		}</wie-bold></wie-item>
${
	tid !== "redgif"
		? `<wie-item><a class='wie-btn' target='_blank' href='https://boards.4chan.org/gif/thread/${tid}?day=${day}&count=${count}'>4Chan</a></wie-item>
		<wie-item><a class='wie-btn' target='_blank' href='https://archived.moe/gif/thread/${tid}?day=${day}&count=${count}'>Archived</a></wie-item>`
		: ""
}
<wie-item><wie-btn class='loading'>${
			SVGConst.Refresh
		}检查更新中</wie-btn></wie-item></wie-line></wie-area>`;
	}
	protected onEvent(el: HTMLElement) {
		if (this.props.tid === "redgif") return;

		this.checkUpdate();
		el.querySelector("wie-btn")?.addEventListener(
			"click",
			this.goUpdate.bind(this)
		);
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
