export default class UrlConst {
	/**
	 * 获取演员信息
	 * @param name 演员
	 */
	public static readonly GET_ACTOR_INFO =
		"http://localhost:5678/webhook/getActorInfo";

	public static readonly GET_CODE_INFO =
		"http://localhost:5678/webhook/getCodeInfo";

	public static readonly CACHE_CODES_PATH =
		"E:\\workspace\\n8n\\.cache\\jav\\codes\\";

	public static readonly CACHE_ACTORS_PATH =
		"E:\\workspace\\n8n\\.cache\\jav\\actors\\";
}
