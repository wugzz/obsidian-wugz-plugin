import CodeBlack from "src/Base/CodeBlock";
import PageCode, { IFile } from "src/UI/PageCode";
import Utils from "src/utils/Utils";
import { IActor } from "src/UI/ICodeInfo";
import { normalizePath } from "obsidian";

export default class JavDashboard extends CodeBlack<IFile> {
	render(): string {
		//读取缓存文件
		// this.getFile("Videos");
		return `
            <wie-area>
                
            </wie-area>
        `;
	}

	getFile(path: string) {
		const targetDir = normalizePath(path);
		const files = this.app.vault.getMarkdownFiles();
		// 2. 过滤指定目录下的文件
		const filteredFiles = files.filter((file) => {
			const fileDir = normalizePath(file.parent?.path || "/"); // 获取文件所在目录
			return fileDir.startsWith(targetDir);
		});

		// 3. 按修改时间排序（从新到旧）
		const sortedFiles = filteredFiles.sort(
			(a, b) => b.stat.ctime - a.stat.ctime // 修改时间戳相减
		);

		// files[0].vault.

		// console.log("--list-", sortedFiles, files, targetDir);
		return sortedFiles;
	}
}
