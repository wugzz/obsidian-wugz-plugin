import N8NTool from "./N8NTool";
import Utils from "./Utils";

interface IFileTree {
	/**  */
	Content: {
		/** 厂商 */
		[key: string]: {
			/** 名称：图片名 */
			[key: string]: string;
		};
	};
}

export default class GFriends {
	private static instance: GFriends;
	/** 头像树 */
	private url =
		"https://raw.githubusercontent.com/gfriends/gfriends/master/Filetree.json";

	private imageTemp = `https://raw.githubusercontent.com/gfriends/gfriends/master/Content/{Studio}/{Name}`;

	private readonly localName: string = "GFriends.json";

	//本地jav缓存
	private localCachePath = "";

	/** 演员树 */
	private actors: {
		[key: string]: [studio: string, name: string];
	};

	private _init: boolean = false;

	public static Instance = () => {
		if (!GFriends.instance) {
			GFriends.instance = new GFriends();
		}
		return GFriends.instance;
	};

	private constructor() {
		// this.init();
	}

	private async init() {
		if (this._init) return;

		//先从本地获取
		let local = await N8NTool.readFile(this.localName);
		// console.log("local", local);
		if (local.success) {
			this.actors = local.content.actors;
			//如果超过一天则重新获取
			if (Date.now() - local.content.date < 24 * 60 * 60 * 1000 * 7) {
				this._init = true;
				return;
			}
		}

		this.actors = {};
		const data: IFileTree = await Utils.fetch(this.url);
		for (const studio in data.Content) {
			for (const name in data.Content[studio]) {
				const url = data.Content[studio][name].replace("AI-Fix-", "");
				this.actors[name.replace(".jpg", "")] = [studio, url];
			}
		}

		let write = await N8NTool.writeFile(this.localName, {
			date: Date.now(),
			actors: this.actors,
		});
		console.log("write", write);
		this._init = true;
	}

	public name(name: string) {
		// this.log("name=", this.actors?.[name]);
		let item = this.actors?.[name];
		if (!item) return name;
		return item[1].split(".")[0];
	}

	/**
	 * 获取演员头像
	 * @param name
	 * @returns
	 */
	public async getActor(name: string) {
		await this.init();
		const actor = this.actors[name];
		if (actor)
			return this.imageTemp
				.replace("{Studio}", actor[0])
				.replace("{Name}", actor[1]);
	}
}
