import CodeBlack from "src/Base/CodeBlock";

interface IProp {
	name?: string;
	href?: string;
}

export default class WButton extends CodeBlack<IProp> {
	renderTemplate(): string {
		const { name = "" } = this.props;
		return `<button>${name}</button>`;
	}

	protected bindEvent(el: HTMLElement) {
		//启动
		const { href = "" } = this.props;
		el.querySelector("button")?.addEventListener("click", () => {
			console.log("click", href);
			if (href) {
				window.open(href, "_blank");
			}
		});
	}
}
