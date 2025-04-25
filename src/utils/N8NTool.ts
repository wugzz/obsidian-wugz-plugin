export interface IDownFile {
	folder?: string;
	name?: string;
	url: string;
}

export interface IObFile {
	/**
	 * 文件路径
	 */
	path: string;
	/**
	 * 文件名
	 */
	name: string;
	/**
	 * 目录
	 */
	folder: string;

	type: string;
}

export default class N8NTool {
	/** 缓存目录 */
	static CachePath = ".cache/jav/";

	/**
	 * 读取本地文件
	 */
	static async readFile(name: string, prePath: string = "") {
		try {
			const res = await fetch(
				`http://localhost:5678/webhook/getCacheByName?name=${name}&path=${
					N8NTool.CachePath + prePath
				}`
			);
			return await res.json();
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	static async writeFile(name: string, content: any, prePath: string = "") {
		try {
			const formData = new FormData();
			formData.append("name", name);
			formData.append("content", JSON.stringify(content));
			formData.append("path", N8NTool.CachePath + prePath);
			const res = await fetch(
				`http://localhost:5678/webhook/setCacheByName`,
				{
					method: "POST",
					body: formData,
				}
			);
			return await res.json();
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	static async AITag(name: string) {
		try {
			const res = await fetch(
				`http://localhost:5678/webhook/aiTag?name=${name}`
			);
			return await res.json();
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	static async downImages(title: string, images: IDownFile[]) {
		const data = new FormData();
		title = title.replace(/[\|\"\']/g, "");
		data.append("title", title);
		data.append("wemb", JSON.stringify(images));

		await fetch("http://localhost:5678/webhook/downComic", {
			method: "POST",
			body: data,
		});
	}

	static async findInOb(
		title: string
	): Promise<{ success: boolean; data: IObFile }> {
		let data = await fetch(`http://127.0.0.1:1234/search?q=${title}`);
		return await data.json();
	}
}
