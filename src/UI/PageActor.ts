import UI from "src/Base/UI";
import { IActor, IVideo } from "./ICodeInfo";
import UIActor from "./UIActor";
import Utils from "src/utils/Utils";
import UrlConst from "src/utils/UrlConst";
import { UILoading } from "./UILoading";
import UIActorCodes from "./UIActorCodes";

export interface IPageActor {
	actor: IActor;
}

interface IState {
	loading?: boolean;
	codes?: IVideo[];
}

export default class PageActor extends UI<IPageActor, IState> {
	render() {
		const { codes = [], loading = true } = this.state;
		console.log("----codes---", codes);
		return `
        <wie-column>
            ${this.ui(UIActor, { actor: this.props.actor })}
            ${
				loading
					? this.ui(UILoading, {})
					: this.ui(UIActorCodes, { codes })
			}
        </wie-column>
        `;
	}

	async onMount() {
		//更新
		const list = await Utils.fetch(
			UrlConst.GET_ACTOR_CODES + `?name=${this.props.actor.name}`
		);

		console.log("----list---", list);

		this.setState({ codes: list ?? [], loading: false });
	}
}
