import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";

interface IProp {
	read?: string;
}

export default class Read extends CodeBlack<IProp> {
	render() {
		return `
            <wie-area>
                <wie-line class="justify-between">
                    已读自动工具
                    <wie-btn onclick='toChange'>${SVGConst.Refresh}切换已读状态</wie-btn>
                </wie-line>
            </wie-area>
        `;
	}

	private observer: IntersectionObserver | null = null;

	private isViewed: boolean = false;

	protected async onMount() {
		//监听元素是否出现在可视区域
		if (this.fileName.startsWith(this.suffix)) {
			//已读
			this.isViewed = true;
			return;
		}

		//延迟加载
		// this.listen();
		//避免全为图片未加载时，就直接触发了
		this.setTimeout(() => this.listen(), 1000);
	}

	protected listen() {
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					this.viewed();
				}
			});
		}, {});
		this.observer.observe(this.view!);
	}

	private get suffix() {
		const { read = "[已读]" } = this.props;
		return read;
	}

	toChange() {
		if (this.isViewed) {
			//切换为未读
			this.isViewed = false;
			this.changeName(false);
		} else {
			//切换为已读
			this.isViewed = true;
			this.changeName(true);
		}
	}

	private changeName(toRead: boolean) {
		const read = this.suffix;
		let fileName = this.fileName;
		if (!fileName) return;

		//关闭监听
		this.observer?.disconnect();

		if (toRead) {
			// if (fileName.startsWith(read)) return;
			fileName = read + fileName + ".md";
		} else {
			// if (!fileName.startsWith(read)) return;
			fileName = fileName.replace(read, "") + ".md";
		}
		// console.log("---read-viewed--", toRead, fileName);
		this.renameFile(fileName);
	}

	viewed() {
		//关闭监听
		this.observer?.disconnect();
		this.observer = null;
		this.isViewed = true;

		//修改文件名,给文件名添加已读前缀
		this.changeName(true);
	}

	protected onDestroy(): void {
		this.observer?.disconnect();
	}
}
