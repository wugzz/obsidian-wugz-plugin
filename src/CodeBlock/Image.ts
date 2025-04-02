import CodeBlack from "src/Base/CodeBlock";

interface IProp {
	path: string;
}

export default class Image extends CodeBlack<IProp> {
	render() {
		// this.app.plugins.

		const { path } = this.props;

		return ` <img src="${this.toLocalPath(path)}" alt="image" />`;
	}
}
