import CodeBlack from "src/Base/CodeBlock";
import Banner from "src/UI/Banner";
import PageCode from "src/UI/PageCode";
import * as fs from "fs";
import Utils from "src/utils/Utils";
import { IActor } from "src/UI/ICodeInfo";

interface IProp {
	/** 名称 */
	name: string;
	/** 文件路径 */
	path: string;
	/** 文件大小 */
	size: string;
	ctime: number;
	mtime: string;
	atime: string;
	cache: string;
}

export default class JavVideo extends CodeBlack<IProp> {
	renderTemplate(): string {
		//读取缓存文件

		const data = this.readJson();
		return `
            ${this.ui(PageCode, {
				data,
				cover: this.localImg(this.videoCover),
				code: this.props.name,
			})}
        `;
	}

	private readJson() {
		const { name } = this.props;

		const data = Utils.wrCode(name);
		//处理
		if (!data) return data;

		//处理actors
		if (!data.actors) return data;
		data.actors = data.actors.map((actor: IActor) => {
			console.log("-----sss", Utils.wrActor(actor.name), actor);
			//优先获取本地
			return Utils.wrActor(actor.name) ?? actor;
		});

		return data;
	}

	private get videoCover() {
		return this.videoFolder + "/" + this.videoName + "-fanart.jpg";
	}

	private get videoFolder() {
		const { path } = this.props;
		return path.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
	}

	private get cachePath() {
		const { path, name } = this.props;
		return "E:\\workspace\\n8n\\.cache\\jav\\codes\\";
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
