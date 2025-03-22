import CodeBlack from "src/Base/CodeBlock";

import { normalizePath, Notice } from "obsidian";
import SVGConst from "src/UI/SVGConst";
import Utils from "src/utils/Utils";
import UrlConst from "src/utils/UrlConst";
import { IFile } from "src/UI/PageCode";
import { ICodeInfo, IScore } from "src/UI/ICodeInfo";
import * as fs from "fs";
import { JavModal } from "src/Modal/JavModal";
import InputHelper from "src/utils/InputHelper";

interface IProps {
	/** 路径 */
	path: string;
	/** 标题 */
	name: string;
	/** 封面 */
	cover: string;
}

/** 缓存列表 */
type IDataCahe = { [key: string]: ICodeInfo };

export default class JavDashboard extends CodeBlack<IProps> {
	private _init: boolean = false;

	private dataCache: IDataCahe = {};

	mount(container: HTMLElement): void {
		super.mount(container);

		console.log("--container-", container);
		container.parentElement!.addClass("wie-full");
	}

	render(): string {
		//初始化
		this.init();
		//读取缓存文件
		// this.getFile("Videos");

		console.log(
			"----render---",
			this.fileDir,
			this.fileName,
			this.filePath
		);

		const { name, cover, path } = this.props;
		const { list = [] } = this.state;
		console.log("---start---", list, this.state);

		return `
            <wie-area style='margin-bottom:20px'>
                <wie-line class='justify-between'>
                    <wie-line>
                    <wie-title class='ellipsis-2'>${name}</wie-title>
                    <input id='wie-filter'></input>
                    </wie-line>
                    <wie-btn onclick='scan'>${
						SVGConst.Refresh
					} 重新检索资源</wie-btn>
                </wie-line>
            </wie-area>

            <wie-grid id='wie-grid'>
                ${this.list
					.map((item: ICodeInfo, index: number) =>
						this.renderVideo(item, index)
					)
					.join("")}
            </wie-grid>
        `;
	}

	protected onEvent(view: HTMLElement): void {
		const input = view.querySelector("#wie-filter") as HTMLInputElement;
		new InputHelper(input, this.filter.bind(this));
	}

	filter(value: string) {
		console.log("--filter-", value);
		let filter: ICodeInfo[] | undefined = undefined;
		if (value)
			filter = this.state.list.filter((item: ICodeInfo) => {
				return (
					item.code.includes(value) ||
					item.title?.includes(value) ||
					(item.tags &&
						new RegExp(item.tags.join("|")).test(value)) ||
					(item.actors &&
						new RegExp(
							item.actors.map((item) => item.name).join("|")
						).test(value))
				);
			});
		this.setState({ filter }, false);
		this.updateList();
	}

	private get list() {
		return this.state.filter || this.state.list;
	}

	private updateList() {
		const grid = this.view!.querySelector("#wie-grid")! as HTMLElement;
		grid.innerHTML = this.list
			.map((item: ICodeInfo, index: number) =>
				this.renderVideo(item, index)
			)
			.join("");
		this.bindEvents(grid);
	}

	private renderVideo(item: ICodeInfo, index: number) {
		return `
            <wie-area style='padding:0;cursor:pointer;' code=${
				item.code
			} onclick='openJav' >
                ${
					item.cover
						? `<img src="${item.cover}" />`
						: `<div style='padding-bottom:67%'></div>`
				}
                <wie-area>
                <wie-line>${item.title}</wie-line>
                <wie-line>
                <wie-tag onclick='copy' data-copy='${item.code}'>${
			item.code
		}</wie-tag>
                    ${this.renderScore("JavDB", item.score)}
                 </wie-line>
                <wie-line>
                </wie-line>
                </wie-area>
            </wie-area>
        `;
	}

	renderScore(title: string, score?: IScore) {
		if (!score) return "";
		let html = `<wie-item class='gap-0'>${SVGConst.Score}<span>${
			score.score
		}</span><span>|${title}${
			(
				typeof score.num === "number"
					? score.num > 0
					: score.num.length > 0
			)
				? `|${score.num}人点评`
				: ""
		}</span></wie-item>`;
		return html;
	}

	openJav(e: Event) {
		const key = (e.currentTarget as HTMLElement).getAttribute("code")!;
		const data = this.dataCache[key];
		const { code, files } = data;
		new JavModal(this.app, {
			data: { code, files },
			updateCodeInfo: this.updateCode.bind(this),
		}).open();
	}

	private get cachePath() {
		console.log("--cachePath-", this.fileDir, this.fileName);
		return `${this.fileDir}/.${this.fileName}.json`;
	}

	private updateCode(info: ICodeInfo) {
		const data = this.dataCache[info.code];
		this.copyCode(data, info);
		this.saveCache(this.dataCache);
	}

	private init() {
		if (this._init) return;
		this._init = true;
		//获取本地
		const json = Utils.read(this.cachePath);
		if (json) this.dataCache = json;

		console.log("init", this.dataCache);
		this.syncData(false);
	}

	private syncData(only: boolean = true) {
		const data = this.dataCache;
		const list = Object.values(data);

		list.sort((a, b) => {
			return Number(b.files![0].ctime) - Number(a.files![0].ctime);
		});
		console.log("----list", list);
		this.setState({ list }, !only);
		if (only) this.updateList();
	}

	private saveCache(cache: IDataCahe) {
		this.dataCache = cache;
		this.syncData();
		Utils.write(this.cachePath, this.dataCache);
	}

	async scan(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		if (btn.classList.contains("loading")) return;
		btn.classList.add("loading");
		//获取文件
		const { path } = this.props;
		//
		const files: IFile[] = await Utils.fetch(
			`${UrlConst.SCAN_PATH}?path=${path}`
		);

		if (!files || files.length === 0) {
			new Notice("未找到任何文件");
			btn.classList.remove("loading");
			return;
		}

		const cache: IDataCahe = {};
		//处理files
		for (let file of files) {
			//如果文件大小小于100M 则不添加
			if (Number(file.size) < 100 * 1024 * 1024) continue;
			const code = this.handleFile(file);
			let data = cache[code.code];
			if (data) {
				const files = data.files ?? [];
				//合并数据
				Object.assign(data, code);
				data.files = [...files, ...(code.files ?? [])];
			} else {
				cache[code.code] = code;
			}
		}
		//
		//更新
		this.saveCache(cache);
		btn.classList.remove("loading");
	}

	private handleFile(file: IFile): ICodeInfo {
		//判断是否有cover
		const data: ICodeInfo = {
			code: file.name,
			title: file.name || file.oname,
			files: [file],
		};

		// const path = file.path.substring(0, file.path.lastIndexOf("/"));
		const name = file.path.substring(0, file.path.lastIndexOf("."));

		//判断是否有.json文件
		const code: ICodeInfo = Utils.wrCode(file.name);

		if (fs.existsSync(name + "-fanart.jpg")) {
			data.cover = Utils.localImg(name + "-fanart.jpg");
		}

		if (code) {
			//方便进行过滤
			this.copyCode(data, code);
		}

		//判断是否有封面图
		console.log("----sslist", name);

		return data;
	}

	private copyCode(data: ICodeInfo, code: ICodeInfo) {
		//方便进行过滤
		data.tags = code.tags || [];
		data.title = code.title || data.title;
		//保存actor
		data.actors = code.actors?.map((item) => ({ name: item.name })) || [];
		data.releaseDate = code.releaseDate;
		data.zh = code.zh;
		data.leak = code.leak;
		data.und = code.und;
		data.score = code.score;

		if (!data.cover) {
			data.cover = Utils.proxyImg(code.cover!);
		}
	}
}
