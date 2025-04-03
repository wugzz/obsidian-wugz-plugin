const copy = require("copy-to-clipboard");
import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";

interface IProp {
	title?: string;
	content: string;
}

export default class Copy extends CodeBlack<IProp> {
	render() {
		const { title, content } = this.props;
		return `
		<wie-area>
			${title ? `<wie-item-title>${SVGConst.Info}${title}</wie-item-title>` : ""}
			<wie-line class="justify-between">
				<div>${content}</div>
				<wie-btn onclick='copy'>${SVGConst.Copy}复制</wie-btn>
			</wie-line>
		</wie-area>
        `;
	}

	copy() {
		copy(this.props.title);
		new Notice("复制成功");
	}
}
