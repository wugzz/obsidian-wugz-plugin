export default class UrlConst {
	/**
	 * 获取演员信息
	 * @param name 演员
	 */
	public static readonly GET_ACTOR_INFO =
		"http://localhost:5678/webhook/getActorInfo";

	public static readonly GET_ACTOR_CODES =
		"http://localhost:5678/webhook/getActorCodes";

	public static readonly GET_CODE_INFO =
		"http://localhost:5678/webhook/getCodeInfo";

	public static readonly GET_SUBS_INFO =
		"http://localhost:5678/webhook/getSubs";

	public static readonly DOWNLOAD_FILE =
		"http://localhost:5678/webhook/download";

	public static readonly CREATE_VIDEOS_MD =
		"http://localhost:5678/webhook/createVideoMarkdown";

	public static readonly VIEW_IS = "http://localhost:5678/webhook/viewIs";

	public static readonly VIEW = "http://localhost:5678/webhook/view";

	public static readonly VIEW_DELETE =
		"http://localhost:5678/webhook/viewDelete";

	/**
	 * 扫描路径
	 * @param path 路径
	 * @param type 类型
	 */
	public static readonly SCAN_PATH = "http://localhost:5678/webhook/scanPath";

	// public static readonly CACHE_CODES_PATH =
	// 	"E:\\workspace\\n8n\\.cache\\jav\\codes\\";

	public static readonly CACHE_CODES_PATH = "I:/videox/.cache/jav/codes/";

	public static readonly CACHE_ACTORS_PATH = "I:/videox/.cache/jav/actors/";
}
