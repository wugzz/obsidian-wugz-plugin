import UI from "src/Base/UI";
import { IActor } from "./ICodeInfo";
import UrlConst from "src/utils/UrlConst";
import Utils from "src/utils/Utils";
import * as fs from "fs";
import SVGConst from "./SVGConst";
import GFriends from "src/utils/GFriends";
import { ActorModal } from "src/Modal/ActorModal";

interface IProps {
	actor: IActor;

	detail?: boolean;
}

export default class UIActor extends UI<IProps> {
	public render() {
		const { actor } = this.props;
		return `<wie-card>
                <img src='${this.actorImage(
					actor,
					"cover"
				)}' class='wie-img-mask'></img>
                <wie-card-info>
                    <wie-avatar><img src='${this.actorImage(
						actor,
						"avatar"
					)}'/></wie-avatar>
                    <wie-item-title style='font-size:20px;'>${
						actor.name
					}</wie-item-title>
                    <wie-line>
                        ${
							actor.birthday
								? `<span>${actor.birthday} ${
										actor.age ??
										this.calcAge(actor.birthday)
								  }</span>`
								: ""
						}
                        ${actor.height ? `<span>${actor.height}cm</span>` : ""}
                        ${actor.blood ? `<span>${actor.blood}</span>` : ""}
                        ${actor.cup ? `<span>${actor.cup}罩杯</span>` : ""}
                    </wie-line>
        
                        
                     <div class='flex justify-between item-center'>
                        ${this.renderLine("样貌", actor.rating?.looks)}
                        ${this.renderLine("身材", actor.rating?.body)}
                        ${this.renderLine("魅力", actor.rating?.charm)}
                        ${this.renderLine("实用", actor.rating?.usefulness)}
                        ${this.renderLine("综合", actor.rating?.overall)}
                    </div>
                    <div class='flex justify-between item-center'>
                        ${this.renderItem(actor, "bust", "胸围")}
                        ${this.renderItem(actor, "hip", "臀围")}
                        ${this.renderItem(actor, "waist", "腰围")}
                       ${this.renderItem(actor, "birthplace", "出身地")}
                       ${this.renderItem(actor, "debut_period", "生涯")}
                    </div>
                    ${
						actor.alias && actor.alias.length > 0
							? `<wie-line><w-name>别名：</w-name><span >${actor.alias.map(
									(item) => item.split(" ")[0]
							  )}</span></wie-line>`
							: ""
					}
                    <div class='flex gap flex-wrap item-center'>
                        ${this.renderItem(actor, "hobby", "爱好")}
                          ${this.renderItem(actor, "tags", "标签")}
                    </div>
                    ${
						actor.first
							? `<div class='wie-actor-line item-start'><wie-sname>出道作品：</wie-sname><span >${actor.first}</span></div>`
							: ""
					}
        
                    <wie-line style='margin-top:5px;'>
                    ${
						this.props.detail
							? `<wie-btn onclick='openDetail'>${SVGConst.Delete}详情</wie-btn>`
							: ""
					}
                    <wie-btn onclick='updateActor'>${
						SVGConst.Refresh
					} 更新信息</wie-btn>
                    ${this.renderButton(
						actor,
						"link",
						"JavDB",
						SVGConst.Detail,
						`https://javdb369.com/search?q=${actor.name}&f=actor`
					)}
                    ${this.renderButton(
						actor,
						"name",
						"Miss",
						SVGConst.Search,
						`https://missav.ai/actresses/${actor.name}?sort=views`
					)}
                    ${this.renderButton(actor, "link_m", "Msin")}
                    ${this.renderButton(actor, "emby", "Emby", SVGConst.Search)}
                    ${this.renderButton(actor, "twitter", "SNS")}
                    ${this.renderButton(actor, "officialSite", "官网")}
                    </wie-line>
                </wie-card-info>
            </wie-card>`;
	}

	openDetail(e: Event) {
		const actor = this.props.actor;
		this.open(ActorModal, { actor });
	}

	async updateActor(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		//如果正在加载中
		if (btn.className.indexOf("loading") > -1) return;

		const actor = this.props.actor;

		//btn
		btn.addClass("loading");

		//同步大图
		if (!actor.cover)
			actor.cover = await GFriends.Instance().getActor(actor.name);

		const ret = await Utils.fetch(
			UrlConst.GET_ACTOR_INFO + `?name=${actor.name}`
		);

		if (ret) {
			Object.assign(actor, ret);

			Utils.wrActor(actor.name, actor);

			//同步下载视频图片
			if (actor.cover) {
				await Utils.download(
					Utils.proxyImg(actor.cover),
					`${UrlConst.CACHE_ACTORS_PATH}`,
					`${actor.name}-cover.jpg`
				);
			}
			//同步小图
			if (actor.avatar) {
				await Utils.download(
					actor.avatar,
					`${UrlConst.CACHE_ACTORS_PATH}`,
					`${actor.name}-avatar.jpg`
				);
			}

			btn.removeClass("loading");
			this.setState({});
		}
	}

	renderButton(
		actor: IActor,
		key: keyof IActor,
		name: string,
		icon: string = SVGConst.Detail,
		href?: string
	) {
		if (!actor[key]) return "";
		return `<a class='wie-btn' target='_blank' href='${
			href ?? actor[key]
		}' >${icon} ${name}</a>`;
	}

	private renderItem(
		actor: IActor,
		key: keyof IActor,
		name: string,
		value?: string | string[]
	) {
		if (!actor[key]) return "";

		return this.renderLine(name, value ?? actor[key]);
	}

	private renderLine(name: string, value?: string) {
		if (!value) return "";
		return `<wie-item>
            <w-desc>${name}：</w-desc>
            <div >${value}</div>
        </wie-item>`;
	}

	private actorImage(actor: IActor, type: "avatar" | "cover") {
		// if (type === "avatar") return actor.avatar;
		// return actor[type];
		//判断本地有没有
		let local = UrlConst.CACHE_ACTORS_PATH + `${actor.name}-${type}.jpg`;
		local = local.replace(/\\/g, "/");
		if (fs.existsSync(local)) return Utils.localImg(local);
		return actor[type];
	}

	public calcAge(birthday: string) {
		birthday = birthday.replace(/[年|月|日]/g, "/");
		const date = new Date(birthday);
		const now = new Date();
		let age = now.getFullYear() - date.getFullYear();
		const month = now.getMonth() - date.getMonth();
		if (month < 0) {
			age = age - 1;
		}
		return `（${age}岁${Math.abs(month)}个月）`;
	}

	/**
	 * 计算cup
	 * @param cup
	 * @returns
	 */
	public static renderCup(cup?: string) {
		const cups = [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L",
		];
		return cups
			.map((c) => {
				return `<w-desc class='${
					c === cup ? "active" : ""
				}'>${c}</w-desc>`;
			})
			.join("");
	}
}
