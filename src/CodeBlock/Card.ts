import CodeBlack from "src/Base/CodeBlock";

interface IProp {
	type?: string;
	title?: string;
	desc?: string;
	bg?: string;
	color?: string;
	descColor?: string;
	borderRadius?: string;
	icon?: string;
}

export default class Card extends CodeBlack<IProp> {
	render(): string {
		const { type = "def" } = this.props;
		let func = (this as any)[type] ?? this.def;
		return func.call(this);
	}

	protected def() {
		// this.app.plugins.

		const {
			title = "请输入描述：title xxx",
			icon,
			desc,
			bg = "#30344c",
			color = "var(--text-normal)",
			descColor = "var(--text-muted)",
			borderRadius = "6px",
		} = this.props;

		return `
        	<div class="w-card" style="background:${bg};color:${color};border-radius:${borderRadius}">
			<div class="title">${this.getIcon(icon)}${title}</div>
			${desc ? `<div class="desc" style='color:${descColor}'>${desc}</div>` : ""}
	</div>
        `;
	}
}
