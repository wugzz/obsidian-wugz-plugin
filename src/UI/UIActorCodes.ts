import UI from "src/Base/UI";
import { IActor, IVideo } from "./ICodeInfo";
import { JavModal } from "src/Modal/JavModal";
import Utils from "src/utils/Utils";

interface IProps {
	codes: IVideo[];
}

export interface ITime {
	/**发布日期 */
	time: string;
	/**演员 */
	actors: Set<string>;
	/** 发布作品 */
	videos: IVideo[];
}

export default class UIActorCodes extends UI<IProps> {
	private filter: string;

	private to(codes: IVideo[]) {
		const videos: ITime[] = [];
		const maps: { [key: string]: ITime } = {};
		const vCache: { [key: string]: true } = {};
		for (let code of codes) {
			const actorName = (code as any).for ?? code.name;
			if (this.filter && actorName !== this.filter) continue;
			//如果已经包含,则继续
			if (vCache[code.code!]) continue;
			vCache[code.code!] = true;
			let cache = maps[code.duration!];
			if (!cache) {
				cache = { time: code.duration!, videos: [], actors: new Set() };
				maps[code.duration!] = cache;
				videos.push(cache);
			}
			cache.actors.add((code as any).for ?? code.name);
			cache.videos.push(code);
		}

		videos.sort(
			(a, b) => new Date(b.time).valueOf() - new Date(a.time).valueOf()
		);

		return videos;
	}

	render(): string {
		const { codes } = this.props;
		const videos = this.to(codes);
		console.log("----videos---", videos, codes);
		const ret = videos
			.map((time) => {
				let v = time.videos.map((v) => this.renderVideo(v));
				// if (this.filter) v = v.filter((v) => v !== "");
				if (v.length === 0) return "";
				return `
					<wie-column style='gap:5px'>
						<wie-line><div class='split'></div>${this.renderTime(
							time.time,
							time.videos.length
						)}</wie-line>
						<wie-code-line>
							${v.join("")}
						</wie-code-line>
					</wie-column>
                `;
			})
			.join("");

		return `<wie-area><wie-codes>${ret}</wie-codes></wie-area>`;
	}

	goCode(e: Event) {
		const code = (e.currentTarget as HTMLElement).getAttribute("code")!;
		this.open(JavModal, { data: { code } });
	}

	renderTime(duration: string, count: number) {
		//获取今天凌晨时间
		const date = new Date(
			this.format(new Date().valueOf(), "yyyy年MM月dd日")
		).valueOf();
		const da = new Date(duration).valueOf();
		const time = date - da;

		if (time == 0) {
			duration = "今天";
		} else if (time > 0 && time <= 24 * 60 * 60 * 1000) {
			duration = "昨天";
		} else if (
			time > 24 * 60 * 60 * 1000 &&
			time <= 24 * 60 * 60 * 1000 * 2
		) {
			duration = "前天";
		}

		// const time =new Date().valueOf() - new Date(duration).valueOf();
		return `${duration}<wie-desc>[${count}部]</wie-desc>`;
	}

	renderVideo = (video: IVideo) => {
		// if (this.filter && video.zh !== this.filter) return "";
		return `
        <wie-code code='${video.code}' onclick='goCode'>
			<img src='${Utils.proxyImg(video.cover!)}'></img>
            <span class='code'>${video.code}</span>
        </wie-code>`;
	};

	private format(time: any, fmt: string) {
		const date = new Date(
			Number(time) < 10000000000 ? Number(time) * 1000 : Number(time)
		); //对于只有10位数的时间做*1000处理
		const o: any = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			S: date.getMilliseconds(), //毫秒
		};
		const week: any = {
			"0": "日",
			"1": "一",
			"2": "二",
			"3": "三",
			"4": "四",
			"5": "五",
			"6": "六",
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(
				RegExp.$1,
				`${date.getFullYear()}`.substr(4 - RegExp.$1.length)
			);
		}
		if (/(E+)/.test(fmt)) {
			fmt = fmt.replace(
				RegExp.$1,
				(RegExp.$1.length > 1
					? RegExp.$1.length > 2
						? "星期"
						: "周"
					: "") + week[date.getDay() + ""]
			);
		}
		for (const k in o) {
			if (new RegExp(`(${k})`).test(fmt)) {
				fmt = fmt.replace(
					RegExp.$1,
					RegExp.$1.length === 1
						? o[k]
						: `00${o[k]}`.substr(`${o[k]}`.length)
				);
			}
		}
		return fmt;
	}
}
