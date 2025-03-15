// import Tool from "../../../Tools/Tool";
// import AVPreview from "../API/Preview/AVPreview";
// import Sync from "../API/Sync";
// import CodeFind from "../CodeFind";
// import Setting from "../Setting";

export enum QTType {
	/** 不存在 */
	NULL = "null",
	/** 下载中 */
	DOWNLOADING = "downloading",
	/** 已下载 */
	DOWNLOADED = "downloaded",
}

export interface ICodeInfo {
	loading?: boolean;
	/** code */
	// code: string;
	cover?: string;

	link_JavDB?: string;
	link_JavLib?: string;
	link_JavMenu?: string;
	/** 发行时间 */
	releaseDate?: string;
	/** 演员 */
	actors?: IActor[];
	/** 导演 */
	director?: string;
	/** 制作商 */
	studio?: string;
	/** 系列 */
	series?: { name: string; url: string };
	/** 评分 */
	score?: IScore;

	score_javlib?: IScore;
	/** 简介 */
	desc?: string;
	/** 预览图 */
	preview?: string[];
	/** 类型 */
	genres?: IGenres[];
	/** 标签 */
	tags?: string[];
	/** 详情页地址 */
	link?: string;
	/** 预告地址 */
	trailer?: string;
	/** 外跳预告地址 */
	oTrailer?: string;
	/** 获取时间 */
	getTime?: number;
	/** emby服务器信息 */
	emby?: string;
	// /** 侧边栏 */
	// sidebar?: IAV[];
	// /** 关联 */
	// related?: IAV[];
	/** 大图 */
	image?: string;
	/** 收录时长 */
	duration?: string;
	/** 是否有中文 */
	zh?: boolean;
	/** 是否无码 */
	leak?: boolean;
	/** 是否4k */
	und?: boolean;

	/** 演员，syncType下，才支持该属性 */
	actor?: IActor;
	/** 顶部区域*/
	top?: string;

	/** 唯一标识 */
	code: string;
	/** 使用的同步器过滤，默认为all类型 */
	syncType?: string;
	/** 评论 */
	comment?: IComment[];
	/** 磁链 */
	magnet?: IMagnet[];
	/** 视频 */
	videos?: IVideo[];
	/**新vs */
	vs?: IVideo[];
	/** 标题 */
	title?: string;
	/** 原标题 */
	oTitle?: string;

	introduce?: string;
	//字幕
	subs?: ISub[];

	qt?: QTType;

	in115?: boolean;

	url115?: string;

	finish?: boolean;

	finishSyncs?: string[];
}

export interface ISub {
	name: string;
	href: string;
}

export interface IComment {
	/** 来源 */
	from: string;
	/** 评论 */
	comment: string;
	/** 评论人 */
	user?: string;
	/** 评论时间 */
	time: string;
	/** 评分 */
	score?: number;
}

/**
 * 磁链信息
 */
export interface IMagnet {
	/** 来源 */
	from: string;
	/** 磁链 */
	magnet: string;
	/** 大小 */
	size: string;
	/** 时间 */
	time: string;
	/** 名字 */
	name: string;
	/** 链接 */
	link: string;
	/** 字节 */
	bytes?: string;
	/** 是否是中文 */
	sub?: boolean;
	/** 是否无码破解 */
	leak?: boolean;
	/** 4K */
	uhd?: boolean;
}

export interface IVideo {
	code?: string;
	/** 标题 */
	name: string;
	/** 链接 */
	link?: string;
	/** 来源 */
	from: string;
	/** 预览图 */
	preview?: string;
	// /** 是否中文 */
	zh?: string;
	/** cover */
	cover?: string;
	// /** 时长 */
	duration?: string;

	/** 图片是否可用 */
	can?: boolean;
	/** potPlayer播放 */
	pot?: string;

	emby?: any;
	/** 字幕 */
	sub?: boolean;
	/** 无码 */
	leak?: boolean;
	/** 4k */
	uhd?: boolean;
}

export interface IScore {
	/** 评分 */
	score: number;
	/** 总分 */
	total: number;
	/** 评分人数 */
	num: number | string;
}

export interface IGenres {
	/** 中文名称 */
	title_zh: string;
	/** 图片地址 */
	imageurl: string;
}

export interface IActor {
	/** 名字 */
	name: string;

	role?: string;
	/** 别名 */
	alias?: string[];
	/** 头像 */
	avatar?: string;
	/** 大封面 */
	cover?: string;
	/** 链接 */
	link?: string;
	/** Msin链接 */
	link_m?: string;
	/** 生日 */
	birthday?: string;
	age?: string;
	/** 身高 */
	height?: string;
	/** cup */
	cup?: string;
	/** 胸围 */
	bust?: string;
	/** 腰围 */
	waist?: string;
	/** 臀围 */
	hip?: string;
	/** 血型 */
	blood?: string;

	birthplace?: string;
	/** 爱好 */
	hobby?: string;
	/** emby服务器信息 */
	emby?: any;
	twitter?: string;
	officialSite?: string;
	first?: string;
	movies?: string;
	/** 职业生涯 */
	debut_period?: string;
	/** sns */
	sns?: string;
	/** 标签 */
	tags?: string[];

	start?: string;

	end?: string;

	finishSyncs?: string[];

	rating?: {
		body: string;
		charm: string;
		looks: string;
		overall: string;
		usefulness: string;
	};
}
