import PageActor, { IPageActor } from "src/UI/PageActor";
import { BaseModal } from "./BaseModal";

export class ActorModal extends BaseModal<IPageActor> {
	render(content: HTMLElement) {
		const page = new PageActor(this.app, this.props);
		content.innerHTML = page.template();
		page.mount(content);
	}
}
