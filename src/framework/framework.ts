// framework.ts
type EventHandler = (event: Event) => void;
type ComponentConstructor<T extends Component> = new () => T;
type PropType = String | Number | Boolean | Object | Array<any> | Function;

interface PropOptions<T = any> {
	type?: PropType;
	default?: T;
	required?: boolean;
	validator?: (value: T) => boolean;
}

interface ComponentOptions {
	props?: Record<string, PropOptions>;
}

export abstract class Component<S = {}, P = {}> extends HTMLElement {
	protected state: S;
	protected props: P;
	private _elements: Record<string, Element> = {};

	private _propDefinitions: Record<string, PropOptions>;

	static get observedAttributes(): string[] {
		return Object.keys(new (this as any)().props);
	}

	constructor(options?: ComponentOptions) {
		super();
		this._propDefinitions = options?.props || {};
		this.props = this._initProps() as P;
		this.state = {} as S;
	}

	private _initProps(): P {
		const props: Record<string, any> = {};

		Object.entries(this._propDefinitions).forEach(([key, options]) => {
			// 从元素属性获取值
			const attrValue = this.getAttribute(key);
			let value: any;

			if (attrValue !== null) {
				// 类型转换
				switch (options.type) {
					case Number:
						value = Number(attrValue);
						break;
					case Boolean:
						value = attrValue === "true" || attrValue === "";
						break;
					case Object:
					case Array:
						try {
							value = JSON.parse(attrValue);
						} catch {
							value = options.default;
						}
						break;
					default:
						value = attrValue;
				}
			} else {
				value = options.default;
			}

			// 验证 required
			if (options.required && value === undefined) {
				throw new Error(`Prop "${key}" is required`);
			}

			// 自定义验证
			if (options.validator && !options.validator(value)) {
				throw new Error(`Invalid value for prop "${key}"`);
			}

			props[key] = value;
		});

		return props as P;
	}

	connectedCallback() {
		this.beforeCreate();
		this.created();
		this.render();
		this.afterMount();
	}

	attributeChangedCallback(name: string, oldVal: string, newVal: string) {
		if (oldVal === newVal) return;

		// 更新 props 并触发更新
		this.props = this._initProps();
		this.onPropsUpdate();
		this.render();
	}

	// 生命周期钩子
	protected beforeCreate(): void {}
	protected created(): void {}
	protected afterMount(): void {}
	protected updated(): void {}

	// 新增生命周期钩子
	protected onPropsUpdate(): void {}

	// 模板方法
	protected abstract template(): string;

	// 渲染逻辑
	private render(): void {
		const template = this.template();
		const parser = new DOMParser();
		const doc = parser.parseFromString(template, "text/html");
		const content = doc.body.firstElementChild as HTMLElement;

		this.bindData(content);
		this.bindEvents(content);
		this.handleSlots(content);

		this.replaceChildren(content);
	}

	// 数据绑定
	private bindData(element: HTMLElement): void {
		const binders = element.querySelectorAll<HTMLElement>("[bind]");
		binders.forEach((el) => {
			const key = el.getAttribute("bind") as keyof S;
			if (this.state[key] !== undefined) {
				el.textContent = String(this.state[key]);
			}
		});
	}

	// 事件绑定
	private bindEvents(element: HTMLElement): void {
		const events = element.querySelectorAll<HTMLElement>("[on]");
		events.forEach((el) => {
			const [eventType, handler] = el.getAttribute("on")!.split(":");
			const handlerFunc = (
				this as unknown as Record<string, EventHandler>
			)[handler];
			if (handlerFunc) {
				el.addEventListener(eventType, handlerFunc.bind(this));
			}
		});
	}

	// 插槽处理
	private handleSlots(element: HTMLElement): void {
		const slots = element.querySelectorAll<HTMLSlotElement>("slot");
		slots.forEach((slot) => {
			const tagName = slot.getAttribute("name")!;
			if (customElements.get(tagName)) {
				const child = document.createElement(tagName);
				slot.replaceWith(child);
			}
		});
	}

	// 状态更新
	protected setState(newState: Partial<S>): void {
		this.state = { ...this.state, ...newState };
		this.render();
		this.updated();
	}

	// 组件注册静态方法
	// 安全的组件注册方法
	static register<T extends Component>(
		this: ComponentConstructor<T>,
		tagName: string
	) {
		customElements.define(tagName, this);
	}
}

// 示例组件
interface CounterProps {
	initialCount?: number;
	step?: number;
}

// // 示例组件实现
// class Counter extends Component<{ count: number }, CounterProps> {
// 	static get observedAttributes() {
// 		return ["initial-count", "step"];
// 	}

// 	constructor() {
// 		super({
// 			props: {
// 				initialCount: {
// 					type: Number,
// 					default: 0,
// 				},
// 				step: {
// 					type: Number,
// 					default: 1,
// 					validator: (val) => val > 0,
// 				},
// 			},
// 		});

// 		this.state = {
// 			count: this.props.initialCount!,
// 		};
// 	}

// 	protected template(): string {
// 		return `
//           <div>
//             <h1 bind="count">${this.state.count}</h1>
//             <button on="click:increment">+${this.props.step}</button>
//             <button on="click:decrement">-${this.props.step}</button>
//           </div>
//         `;
// 	}

// 	private increment(): void {
// 		this.setState({ count: this.state.count + 1 });
// 	}

// 	private decrement(): void {
// 		this.setState({ count: this.state.count - 1 });
// 	}
// }

// class ChildComponent extends Component {
// 	protected template(): string {
// 		return `<p style="color: blue;">Child Component</p>`;
// 	}
// }

// class App extends Component {
// 	protected template(): string {
// 		return `
//       <div>
//         <h2>App Component</h2>
//         <my-counter>
//           <my-child name="child-component"></my-child>
//         </my-counter>
//       </div>
//     `;
// 	}
// }

// // 注册组件
// Component.register.call(Counter, "my-counter");
// Component.register.call(ChildComponent, "my-child");
// Component.register.call(App, "my-app");
