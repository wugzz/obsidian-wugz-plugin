import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";
import UrlConst from "src/utils/UrlConst";
import Utils from "src/utils/Utils";

interface IProp {
	type: "video" | "image";
	folder?: string;
	dir?: string;
}

export default class FindVideo extends CodeBlack<IProp> {
	render(): string {
		const { dir, folder } = this.props;
		return `<wie-area><wie-line style='gap:15px;justify-content:space-between'>
		<wie-item><w-name>查找路径:</w-name><wie-bold>${folder}</wie-bold></wie-item>
		<wie-item><w-name>目标:</w-name><wie-bold>${dir}</wie-bold></wie-item>
			<wie-btn onclick='recheck'>${SVGConst.Refresh}检索目录</wie-btn>
		</wie-line>
	</wie-area>`;
	}

	protected async recheck(e: Event) {
		const btn = e.currentTarget as HTMLElement;

		const file = this.app.workspace.getActiveFile();

		if (!file) return;

		let path = this.localPath(file.path);

		const { dir } = this.props;

		//获取目录
		let tFolder = path.split("\\").slice(0, -1).join("/") + "/" + dir;
		//获取名称

		// return;

		if (btn.hasClass("loading")) return;
		btn.addClass("loading");

		const { folder, type = "video" } = this.props;

		//请求
		let url =
			type === "video"
				? UrlConst.CREATE_VIDEOS_MD
				: UrlConst.CREATE_IMAGES_MD;
		const ret = await Utils.fetch(
			`${url}?path=${folder}&folder=${tFolder}&split=true`
		);

		if (ret) {
			new Notice("生成成功");
		} else {
			new Notice("生成失败，请重试");
		}
		btn.removeClass("loading");
	}
}
