import * as fs from "fs";
import UrlConst from "./UrlConst";
import { IActor, ICodeInfo } from "src/UI/ICodeInfo";
import { exec } from "child_process";
const copy = require("copy-to-clipboard");

export default class Utils {
	/**
	 * 格式化时间显示
	 * @param date 输入的时间（可以是 Date 对象或时间戳）
	 * @returns 格式化后的时间字符串
	 */
	public static formatRelativeTime(date?: Date | number | string): string {
		if (!date) return "";
		const now = new Date();
		const target = new Date(date);
		const timeFormatter = (d: Date) => d.toTimeString().slice(0, 8); // HH:mm:ss

		// 核心时间差计算（毫秒级精度）
		const delta = now.getTime() - target.getTime();
		const seconds = Math.floor(delta / 1000);

		// 当天时间计算（基于自然日判断）
		const isSameDay = (a: Date, b: Date) =>
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();

		// 动态日期描述逻辑
		if (seconds < 60) return `${seconds}秒前`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;

		if (isSameDay(now, target)) {
			return `今天 ${timeFormatter(target)}`; // 当天非近况显示具体时间
		}

		const yesterday = new Date(now);
		yesterday.setDate(now.getDate() - 1);
		if (isSameDay(yesterday, target))
			return `昨天 ${timeFormatter(target)}`;

		const dayBeforeYesterday = new Date(yesterday);
		dayBeforeYesterday.setDate(yesterday.getDate() - 1);
		if (isSameDay(dayBeforeYesterday, target))
			return `前天 ${timeFormatter(target)}`;

		// 超过3天，显示完整日期时间
		return typeof date === "string" ? date : date.toLocaleString();
	}

	/**
	 * 是否已经查看
	 */
	public static async isView(name: string, table = "view") {
		const item = await this.fetch(
			UrlConst.VIEW_IS + `?name=${name}&table=${table}`
		);
		return !!item?._id;
	}

	/**
	 * 执行已读
	 * @param name
	 */
	public static async viewed(name: string, table = "view") {
		const item = await this.fetch(
			UrlConst.VIEW +
				`?name=${name}&table=${table}&date=${new Date().toISOString()}`
		);
	}

	/**
	 * 执行已读
	 * @param name
	 */
	public static async viewDelete(name: string, table = "view") {
		const item = await this.fetch(
			UrlConst.VIEW_DELETE +
				`?name=${name}&table=${table}&date=${new Date().toISOString()}`
		);
	}

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
