import CodeBlack from "src/Base/CodeBlock";
import Banner from "src/UI/Banner";
import PageCode, { IFile } from "src/UI/PageCode";
import * as fs from "fs";
import Utils from "src/utils/Utils";
import { IActor } from "src/UI/ICodeInfo";

export default class JavVideo extends CodeBlack<IFile> {
	render(): string {
		//读取缓存文件

		const data = this.readJson();
		return `
            ${this.ui(PageCode, {
				data: {
					code: this.props.name,
					...(data ?? {}),
				},
				file: this.props,
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
			// console.log("-----sss", Utils.wrActor(actor.name), actor);
			//优先获取本地
			return Utils.wrActor(actor.name) ?? actor;
		});

		return data;
	}
}
