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

export default class Tip extends CodeBlack<IProp> {
	render(): string {
		const { type = "def" } = this.props;
		let func = (this as any)[type] ?? this.def;
		return func.call(this);
	}

	protected def() {
		// this.app.plugins.

		const {
			title = "请输入标题：title xxx",
			icon,
			desc,
			bg = "#b22b2b20",
			color = "#b22b2b",
			descColor = "var(--text-muted)",
			borderRadius = "6px",
		} = this.props;

		return `
        	<div class="w-tip" style="background:${bg};color:${color};border-radius:${borderRadius};border-color:${color}">
			<div class="title">${this.getIcon(icon)}${title}</div>
			${desc ? `<div class="desc" style='color:${descColor}'>${desc}</div>` : ""}
	</div>
        `;
	}
}
