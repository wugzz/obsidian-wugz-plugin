const debounce = (fn: any, delay: number) => {
	let timer: any;
	return function (...args: any[]) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
};

export default class InputHelper {
	isComposing: boolean = false;

	constructor(
		element: HTMLInputElement,
		private onChange: (str: string) => void,
		debounceTime: number = 500
	) {
		this.handleInput = debounce(this.handleInput.bind(this), debounceTime);
		element.addEventListener("compositionstart", () => {
			this.isComposing = true;
		});
		element.addEventListener("compositionend", (e) => {
			this.isComposing = false;
			this.handleInput(e);
		});
		element.addEventListener("input", this.handleInput.bind(this));
	}

	handleInput(e: Event) {
		if (this.isComposing) return;
		const target = e.target as HTMLInputElement;
		this.onChange?.(target.value);
	}

	// const handleSearch = debounce((e) => {
	//     if (isComposing) return; // 中文输入过程中，不进行搜索
	//     console.log('搜索内容：', e.target.value);
	// }, 500);
}
