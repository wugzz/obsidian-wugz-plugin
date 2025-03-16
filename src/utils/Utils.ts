import * as fs from "fs";
import UrlConst from "./UrlConst";
import { IActor, ICodeInfo } from "src/UI/ICodeInfo";
import { exec } from "child_process";
const copy = require("copy-to-clipboard");

export default class Utils {
	public static copy(value: string | object) {
		if (!value) return;
		try {
			if (typeof value === "object") value = JSON.stringify(value);
			copy(value);
		} catch (e) {}
	}

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

	public static async download(url: string, folder: string, name: string) {
		const res = await fetch(
			UrlConst.DOWNLOAD_FILE +
				`?url=${encodeURIComponent(url)}&folder=${encodeURIComponent(
					folder
				)}&name=${encodeURIComponent(name)}`
		);
		if (res.status === 200) {
			return true;
		} else {
			return false;
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
			let actor = this.read(UrlConst.CACHE_ACTORS_PATH + "/" + name);
			//兼容 {actor:xxx,date:xxx} 格式
			if (actor?.date) return actor.actor;
			return actor;
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
			// console.log("readJson", error);
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

	public static openFolder(path: string) {
		path = path.replace(/\//g, "\\");
		exec(`explorer "${path}"`);
	}

	public static openFile(path: string) {
		path = path.replace(/\//g, "\\");
		exec(`start "" "${path}"`);
	}

	public static localImg(localPath: string) {
		localPath = localPath.replace(/\\/g, "/");
		return `http://localhost:5678/webhook/img?path=${localPath}`;
	}

	public static proxyImg(url: string) {
		return `https://wsrv.nl/?url=${url}`;
	}
}
