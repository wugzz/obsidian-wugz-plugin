import * as fs from "fs";
import UrlConst from "./UrlConst";
import { IActor, ICodeInfo } from "src/UI/ICodeInfo";

export default class Utils {
	public static async fetch(url: string, options: RequestInit = {}) {
		try {
			const res = await fetch(url, options);
			if (res.status === 200) {
				return await res.json();
			}
		} catch (error) {
			console.log(error);
		}
	}

	/**
	 * 读写缓存
	 * @param name
	 * @param content
	 * @returns
	 */
	public static wrActor(name: string, content?: IActor) {
		if (!content) {
			return this.read(UrlConst.CACHE_ACTORS_PATH + "/" + name);
		}

		this.write(UrlConst.CACHE_ACTORS_PATH + "/" + name, content);
	}

	public static wrCode(code: string, content?: ICodeInfo) {
		if (!content) {
			return this.read(UrlConst.CACHE_CODES_PATH + "/" + code + ".json");
		}

		this.write(UrlConst.CACHE_CODES_PATH + "/" + code + ".json", content);
	}

	public static read(path: string) {
		try {
			const json = fs.readFileSync(path, "utf-8");
			return JSON.parse(json);
		} catch (error) {
			console.log("readJson", error);
		}
	}

	public static write(path: string, content: any) {
		try {
			if (typeof content === "object") content = JSON.stringify(content);
			fs.writeFileSync(path, content);
		} catch (error) {
			console.log("writeJson", error);
		}
	}
}
