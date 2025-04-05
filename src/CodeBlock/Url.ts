const copy = require("copy-to-clipboard");
import { MarkdownView, Notice, request } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";

interface IProp {
	title?: string;
	url: string;
	favicon?: string;

	type?: "url" | "lee";
}

export default class Url extends CodeBlack<IProp> {
	private isChecked: boolean = false;

	render() {
		// this.app.plugins.
		const { title, url } = this.props;

		if (!url)
			return `<wie-area-line style="color: red;">❌ 请输入有效的 URL</wie-area-line>`;
		//判断是否包含
		if (!title && !this.isChecked) this.fetchWebsiteData(url);
		return this.renderPreview();
		// return `<wie-area-line style="color: gray;">⏳ 正在加载...</wie-area-line>`;
	}

	renderPreview() {
		const { title, url, favicon } = this.props;
		return `
            <wie-area-line class="justify-between">
				<wie-line>
					${
						favicon
							? `<img src="${favicon}" alt="Favicon" width="24" height="24" style="border-radius: 4px;">`
							: ""
					}
					<a href="${url}" target="_blank" style="color:#333;font-weight: bold;">${
			title ?? url
		}</a>
				</wie-line>
				<wie-btn onclick='copy'>${SVGConst.Copy}复制</wie-btn>
            </wie-area-line>
        `;
	}

	copy() {
		copy(this.props.url);
		new Notice("复制成功");
	}

	async fetchWebsiteData(url: string) {
		this.isChecked = true;
		try {
			const html = await request({ url });
			const doc = new DOMParser().parseFromString(html, "text/html");

			// 获取网页标题
			let title = doc.querySelector("title")?.innerText || url;

			// 获取 Favicon
			let favicon = this.extractFavicon(doc, url);

			this.handleLee(doc, html);

			//title转义
			title = title.replace(/\||\n/g, "");

			this.updateProps({ title, favicon });
		} catch (error) {
			// console.error("❌ 请求失败，使用默认数据:", error);
			this.setState();
		}
	}

	handleLee(doc: Document, html: string) {
		const { type } = this.props;
		if (type !== "lee") return;

		//查找 content
		let content = doc
			.querySelector("meta[name=description]")
			?.getAttribute("content")!;
		const [title] = content.split(" - ");
		content = content
			.replace(/\[(https?:\/\/[^\]]+)\]/g, "![]($1)")
			.replace(`${title} - `, "");

		const diff = html.match(/"difficulty":\s*"([^"]+)"/)?.[1]!;
		const diffNames: any = { Medium: "中等", Easy: "简单", Hard: "困难" };
		const tagsMatch = [...html.matchAll(/"translatedName":\s*"([^"]+)"/g)]
			.map((match) => `#${match[1]}`)
			.join(" ");
		// const title = doc.querySelector("title")?.innerText;

		let fileName = `(${diffNames[diff]}) ${title}.md`;

		//修改文件内容
		this.updateContent([
			[/--内容--/g, content],
			[/--标签--/g, tagsMatch],
		]);

		this.renameFile(fileName);
	}

	extractFavicon(doc: Document, url: string): string {
		const faviconEl = doc.querySelector(
			'link[rel~="icon"]'
		) as HTMLLinkElement;

		if (faviconEl) {
			return new URL(faviconEl.getAttribute("href")!, url).href;
		}
		return this.getDefaultFavicon(url);
	}

	getDefaultFavicon(url: string): string {
		return `https://www.google.com/s2/favicons?sz=64&domain=${
			new URL(url).hostname
		}`;
	}
}
