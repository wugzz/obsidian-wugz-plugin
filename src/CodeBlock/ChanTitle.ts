import CodeBlack from "src/Base/CodeBlock";

interface IProp {
	tid?: string;
	count?: string;
	day?: string;
}

export default class ChanTitle extends CodeBlack<IProp> {
	renderTemplate(): string {
		const { tid = "未知", count = 0 } = this.props;
		return `<div class='flex b-bottom b-top p-y gap-10 align-center' >
<div class='w-item'><div>帖子ID:</div><div id='4chan-tid'>${tid}</div></div>
<div class='w-item'><div>图片数量:</div><div class='4chan-images'>${count}</div></div>
<div class='w-item'><button style='display:none'></button></div>`;
	}

	protected bindEvent(el: HTMLElement) {
		this.checkUpdate();
		el.querySelector("button")?.addEventListener(
			"click",
			this.goUpdate.bind(this)
		);
	}

	private isUpdate: boolean = false;

	async goUpdate() {
		const { tid = "", day } = this.props;
		if (!tid) return;

		if (this.isUpdate) return;
		this.isUpdate = true;
		let key = "(更新中)";
		const btn = this.view.querySelector("button")!;
		btn.textContent = btn.textContent + key;
		try {
			const url = `http://localhost:5678/webhook/down4ChanDetail?thread=${tid}&day=${day}`;
			await fetch(url);
			//等待3秒
			await new Promise((resolve) => setTimeout(resolve, 3000));

			//修改
			btn.style.display = "none";
		} catch (e) {
			console.log(e);
			btn.textContent = btn.textContent.replace(key, "");
		}
		this.isUpdate = false;
	}

	async checkUpdate() {
		// const activeFile = app.workspace.getActiveFile();
		// const [a, b, t] = activeFile?.path.split("-");
		const { tid, count = 0, day } = this.props;

		if (!tid) return;

		//请求
		try {
			console.log("--4Chan-检查帖子--", tid);
			let res = await fetch(
				`http://localhost:5678/webhook/getChatTheadInfo?t=${tid}`
			);
			const data = await res.json();
			console.log("--4Chan-检查帖子--", data);
			//如果大于当前值，则代表有更新
			if (data.posts > Number(count)) {
				const btn = this.view.querySelector("button")!;
				btn.textContent = `新图片:${data.posts}`;
				btn.style.display = "block";
			}
		} catch (error) {
			console.log("-4Chan-检查帖子-", error);
		}
	}
}
