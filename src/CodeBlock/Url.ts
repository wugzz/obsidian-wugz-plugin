const copy = require("copy-to-clipboard");
import { Notice } from "obsidian";
import CodeBlack from "src/Base/CodeBlock";
import SVGConst from "src/UI/SVGConst";
import { UILoading } from "src/UI/UILoading";

interface IProp {
	title?: string;
	url: string;
}

interface IWeb {
	favicon: string;
	url: string;
	title: string;
}

export default class Url extends CodeBlack<IProp> {
	private static Cache: Map<string, IWeb> = new Map();

	render() {
		// this.app.plugins.
		const { title, url } = this.props;

		if (!url)
			return `<wie-area-line style="color: red;">❌ 请输入有效的 URL</wie-area-line>`;
		//判断是否包含
		const web = Url.Cache.get(url);
		if (web) return this.renderPreview(web);
		else this.fetchWebsiteData(url);
		return `<wie-area-line style="color: gray;">⏳ 正在加载...</wie-area-line>`;
	}

	renderPreview(web: IWeb) {
		return `
            <wie-area-line class="justify-between">
				<wie-line>
					<img src="${web.favicon}" alt="Favicon" width="24" height="24" style="border-radius: 4px;">
					<a href="${web.url}" target="_blank" style="color:#333;font-weight: bold;">${web.title}</a>
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
		try {
			const response = await fetch(url);
			const html = await response.text();
			const doc = new DOMParser().parseFromString(html, "text/html");

			// 获取网页标题
			let title = doc.querySelector("title")?.innerText || "（无标题）";

			// 获取 Favicon
			let favicon = this.extractFavicon(doc, url);

			Url.Cache.set(url, { title, favicon, url });
		} catch (error) {
			// console.error("❌ 请求失败，使用默认数据:", error);
			Url.Cache.set(url, {
				title: url,
				favicon: this.getDefaultFavicon(url),
				url,
			});
		}

		this.setState();
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
