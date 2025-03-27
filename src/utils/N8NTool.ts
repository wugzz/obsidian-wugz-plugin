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
}
