import MyPlugin from "main";
import * as path from "path";

export default class OFile {
	private static get app() {
		return MyPlugin.App;
	}

	static getResourcePath(fileName: string): string | null {
		let path = this.getLocalPath(fileName);
		return path ? this.app.vault.adapter.getResourcePath(path) : null;
	}

	static localPath(filePath: string): string {
		const basePath = (this.app.vault.adapter as any).basePath;
		return path.resolve(basePath, filePath);
	}

	static getLocalPath(fileName: string): string | null {
		const files = this.app.vault.getFiles();
		// 遍历所有文件，查找匹配的文件名
		for (const file of files) {
			if (file.name === fileName) {
				return file.path; // 返回文件的完整路径
			}
		}
		return null; // 如果未找到匹配的文件，返回 null
	}
}
