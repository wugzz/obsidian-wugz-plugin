import UI from "src/Base/UI";

interface IProp {
	path: string;
}

export default class Banner extends UI<IProp> {
	render() {
		return `<img src="${this.props.path}" alt=""  />`;
	}
}
