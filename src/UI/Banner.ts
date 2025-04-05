import CodeBlack from "src/Base/CodeBlock";
import UI from "src/Base/UI";

interface IProp {
	path: string;
}

export default class Banner extends CodeBlack<IProp> {
	render() {
		return `<img src="${this.props.path}" alt=""  />`;
	}
}
