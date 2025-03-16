export default class Actor {
	/**
	 * 计算年龄
	 * @param birthday
	 * @returns
	 */
	public static calcAge(birthday: string) {
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
