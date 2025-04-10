import CodeBlack from "src/Base/CodeBlock";
import * as fs from "fs";

interface IProp {
	path: string;

	split?: string;
}

export default class Image extends CodeBlack<IProp> {
	render() {
		// this.app.plugins.

		const { path, split } = this.props;

		let url = this.toLocalPath(path);

		// if (split) this.split(url);

		return ` <img src="${url}" alt="image" style='vertical-align: top;'/>`;
	}

	protected async onMount() {
		const { path, split = "1" } = this.props;
		if (split === "1") return;
		this.split(Number(split));
	}

	async split(split: number) {
		const image = this.view?.querySelector("img") as HTMLImageElement;

		// console.log("newUrl", image, split);
		if (!image) return;
		// //判读
		// const data = await fetch(url, { mode: "no-cors" }).then((res) =>
		// 	res.blob()
		// );
		// const newUrl = URL.createObjectURL(data);

		// console.log("newUrl", newUrl);

		// image.src = await this.convertImageUrlToBase64Canvas(split);

		// 如果图片已加载完成，直接处理；否则等待
		// if (image.complete && image.naturalWidth !== 0) {
		// 	this.restoreImageFromURL(image, split);
		// } else {
		// 	image.onload = () => this.restoreImageFromURL(image, split);
		// }
	}

	async restoreImageFromURL(curImg: HTMLImageElement, slices: number) {
		try {
			// let url = curImg.src;
			// // Step 1: 拉取图片为 Blob（前提是服务端允许 CORS）
			// const res = await fetch(url, { mode: "no-cors" });
			// const blob = await res.blob();

			// // Step 2: 创建安全 URL
			// const objectUrl = URL.createObjectURL(blob);

			// Step 3: 创建 img 元素并加载
			curImg.src = await this.readImageAsBase64();
			await new Promise((resolve, reject) => {
				curImg.onload = resolve;
				curImg.onerror = reject;
			});

			// Step 4: 创建 canvas 并拼图
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const width = curImg.naturalWidth;
			const height = curImg.naturalHeight;

			// return;

			canvas.width = width;
			canvas.height = height;

			const sliceHeight = Math.floor(height / slices);
			const remainder = height % slices;

			console.log(width, height, slices, remainder, sliceHeight);

			let destY = 0;

			for (let i = 0; i < slices; i++) {
				const actualHeight = sliceHeight + (i === 0 ? remainder : 0);
				const srcY = height - destY - actualHeight;

				// 注意：所有坐标都使用整数，避免 subpixel 渲染带来缝隙
				ctx.drawImage(
					curImg,
					0,
					Math.round(srcY), // src x, y
					Math.round(width),
					Math.round(actualHeight), // src w, h
					0,
					Math.round(destY), // dest x, y
					Math.round(width),
					Math.round(actualHeight) // dest w, h
				);

				destY += actualHeight;
			}

			// Step 5: 创建一个新的 img，赋值还原后的图
			curImg.src = canvas.toDataURL("image/webp");

			//将Base64图片保存到本地
			this.toLocal(curImg.src);
		} catch (e) {
			console.error("❌ 图片处理失败:", e);
			return null;
		}
	}

	private toLocal(data: string) {
		const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		fs.writeFileSync(this.props.path, buffer);

		this.updateProps({ split: "1" });
	}

	// async restoreImageManually(img: HTMLImageElement, slices = 10) {
	// 	//判读
	// 	img.onload = () => {};
	// 	const width = img.naturalWidth;
	// 	const height = img.naturalHeight;
	// 	img.crossOrigin = "anonymous";

	// 	const canvas = document.createElement("canvas");
	// 	const ctx = canvas.getContext("2d")!;
	// 	canvas.width = width;
	// 	canvas.height = height;

	// 	const sliceHeight = Math.floor(height / slices);
	// 	const remainder = height % slices;

	// 	console.log(
	// 		"----slices",
	// 		slices,
	// 		sliceHeight,
	// 		remainder,
	// 		width,
	// 		height
	// 	);

	// 	for (let i = 0; i < slices; i++) {
	// 		const actualHeight = sliceHeight + (i === 0 ? remainder : 0);
	// 		const srcY =
	// 			height - (i + 1) * sliceHeight - (i === 0 ? remainder : 0);
	// 		const destY = i * sliceHeight + (i === 0 ? 0 : remainder);

	// 		ctx.drawImage(
	// 			img,
	// 			0,
	// 			srcY,
	// 			width,
	// 			actualHeight,
	// 			0,
	// 			destY,
	// 			width,
	// 			actualHeight
	// 		);
	// 	}

	// 	// 直接替换原图内容
	// 	img.src = canvas.toDataURL("image/webp");
	// 	// img.src = `${URL.createObjectURL(
	// 	// 	(await this.canvasToBlob(canvas, "image/webp")) as any
	// 	// )}#.webp`;
	// }

	async readImageAsBase64(): Promise<string> {
		const { path } = this.props;
		const base64 = await fs.readFileSync(path, { encoding: "base64" });
		// const base64 = this.arrayBufferToBase64(arrayBuffer);

		// 获取 MIME 类型（简单判断）
		const mimeType = path.endsWith(".png")
			? "image/png"
			: path.endsWith(".jpg") || path.endsWith(".jpeg")
			? "image/jpeg"
			: path.endsWith(".webp")
			? "image/webp"
			: "application/octet-stream";

		return `data:${mimeType};base64,${base64}`;
	}

	async canvasToBlob(canvas: any, type: string, quality = 1) {
		if (canvas instanceof OffscreenCanvas)
			return canvas.convertToBlob({
				type,
				quality,
			});
		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob: any) =>
					blob
						? resolve(blob)
						: reject(new Error("Canvas toBlob failed")),
				type,
				quality
			);
		});
	}

	// async convertImageUrlToBase64Canvas(url: string) {
	// 	// Step 1: fetch 图片并转 blob
	// 	const response = await fetch(url, { mode: "no-cors" });
	// 	const blob = await response.blob();

	// 	// Step 2: blob 转 base64
	// 	const base64: string = await new Promise((resolve) => {
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => resolve(reader.result as string);
	// 		reader.readAsDataURL(blob);
	// 	});

	// 	// Step 3: 加载成 Image 并绘制进 canvas
	// 	const img: any = await new Promise((resolve) => {
	// 		const image = new window.Image();
	// 		image.onload = () => resolve(image);
	// 		image.crossOrigin = "anonymous"; // 可选，避免污染
	// 		image.src = base64;
	// 	});

	// 	// Step 4: 创建 canvas 并绘图
	// 	const canvas = document.createElement("canvas");
	// 	canvas.width = img.width;
	// 	canvas.height = img.height;
	// 	const ctx = canvas.getContext("2d")!;
	// 	ctx.drawImage(img, 0, 0);

	// 	// Step 5: 导出 base64 图像
	// 	const finalBase64 = canvas.toDataURL("image/webp");

	// 	console.log("----list", finalBase64);

	// 	return finalBase64;
	// }

	// onImageLoaded(e: HTMLImageElement) {
	// 	var t = document.createElement("canvas");
	// 	var a = t.getContext("2d"),
	// 		n = e.width,
	// 		d = e.naturalWidth,
	// 		i = e.naturalHeight;
	// 	(t.width = d),
	// 		(t.height = i),
	// 		(n > e.parentNode.offsetWidth || 0 == n) &&
	// 			(n = e.parentNode.offsetWidth),
	// 		(t.style.width = n + "px"),
	// 		(t.style.display = "block");
	// 	var o = document.getElementById(e.id).parentNode;
	// 	o = (o = o.id.split("."))[0];
	// 	for (
	// 		var s = get_num(window.btoa(aid), window.btoa(o)),
	// 			r = parseInt(i % s),
	// 			l = d,
	// 			m = 0;
	// 		m < s;
	// 		m++
	// 	) {
	// 		var c = Math.floor(i / s),
	// 			g = c * m,
	// 			w = i - c * (m + 1) - r;
	// 		0 == m ? (c += r) : (g += r),
	// 			a.drawImage(e, 0, w, l, c, 0, g, l, c);
	// 	}
	// }

	// async canvasToBlob(canvas: any, type: string, quality = 1) {
	// 	if (canvas instanceof OffscreenCanvas)
	// 		return canvas.convertToBlob({
	// 			type,
	// 			quality,
	// 		});
	// 	return new Promise((resolve, reject) => {
	// 		canvas.toBlob(
	// 			(blob: any) =>
	// 				blob
	// 					? resolve(blob)
	// 					: reject(new Error("Canvas toBlob failed")),
	// 			type,
	// 			quality
	// 		);
	// 	});
	// }
}
