import UI from "src/Base/UI";
import SVGConst from "./SVGConst";

interface IProps {
	svg?: string;
	text: string;
}

export class UINull extends UI<IProps> {
	render() {
		const { svg = SVGConst.Null, text } = this.props;
		return `<wie-area class='wie-null'>
            <div>${svg}</div>
            <div>${text}</div>
        </wie-area>`;
	}
}
