import CodeBlack from "src/Base/CodeBlock";
import { ICodeInfo } from "src/UI/ICodeInfo";
import PageCode, { IFile } from "src/UI/PageCode";

export default class JavVideo extends CodeBlack<IFile> {
	render(): string {
		//读取缓存文件

		return `
            ${this.ui(PageCode, {
				data: { code: this.props.name, files: [this.props] },
			})}
        `;
	}
}
