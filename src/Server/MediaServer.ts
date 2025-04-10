import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { App, TFile } from "obsidian";
import MyPlugin from "main";
import OFile from "src/utils/File";

export class MediaServer {
	private server: http.Server | null = null;
	private port: number;

	constructor(port: number) {
		this.port = port;
	}

	startServer() {
		this.server = http.createServer((req, res) => {
			// 设置 CORS 头部，允许所有源访问
			res.setHeader("Access-Control-Allow-Origin", "*"); // 允许所有来源
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // 允许的 HTTP 方法
			res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // 允许的请求头

			if (!req.url) {
				res.writeHead(400, { "Content-Type": "text/plain" });
				res.end("Bad Request");
				return;
			}

			const urlParams = new URLSearchParams(req.url.split("?")[1] || "");
			const filePath = urlParams.get("q");

			// console.log("请求的文件路径:", filePath, req.url);
			if (req.url.startsWith("/search")) {
				return this.search(res as any, filePath!);
			}

			if (!filePath) {
				res.writeHead(400, { "Content-Type": "text/plain" });
				res.end("File path not specified");
				return;
			}

			const fullPath = path.resolve(filePath);
			if (!fs.existsSync(fullPath)) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("File not found");
				return;
			}

			const stat = fs.statSync(fullPath);
			const fileSize = stat.size;
			const ext = path.extname(fullPath).slice(1).toLowerCase();

			const mimeTypes = new Map([
				["png", "image/png"],
				["gif", "image/gif"],
				["jpg", "image/jpeg"],
				["jpeg", "image/jpeg"],
				["mp4", "video/mp4"],
				["webm", "video/webm"],
				["ogg", "video/ogg"],
				["ogv", "video/ogg"],
				["ts", "video/mp2t"], // ✅ 支持 .ts (MPEG-TS) 视频
				["m3u8", "application/vnd.apple.mpegurl"], // ✅ HLS (Apple HTTP Live Streaming)
				["oga", "audio/ogg"],
				["mp3", "audio/mpeg"],
				["wav", "audio/wav"],
				["weba", "audio/webm"],
			]);

			const contentType =
				mimeTypes.get(ext) || "application/octet-stream";

			// 处理 Range 请求（支持拖拽播放）
			const range = req.headers.range;
			if (range) {
				const [_, startStr, endStr] =
					range.match(/bytes=(\d*)-(\d*)?/) || [];
				const start = startStr ? parseInt(startStr, 10) : 0;
				const end = endStr
					? parseInt(endStr, 10)
					: Math.min(start + 1024 * 1024, fileSize - 1); // 1MB Chunk

				if (start >= fileSize || end >= fileSize) {
					res.writeHead(416, {
						"Content-Range": `bytes */${fileSize}`,
					});
					res.end();
					return;
				}

				const chunkSize = end - start + 1;
				res.writeHead(206, {
					"Content-Range": `bytes ${start}-${end}/${fileSize}`,
					"Accept-Ranges": "bytes",
					"Content-Length": chunkSize,
					"Content-Type": contentType,
				});

				fs.createReadStream(fullPath, { start, end }).pipe(res);
			} else {
				// 普通请求，完整返回
				res.writeHead(200, {
					"Content-Length": fileSize,
					"Content-Type": contentType,
					"Accept-Ranges": "bytes",
				});

				const fileStream = fs.createReadStream(fullPath);

				// 监听客户端中途关闭，及时释放资源
				req.on("close", () => {
					fileStream.destroy();
					console.log("Client disconnected, file stream closed.");
				});

				fileStream.pipe(res);
			}
		});

		this.server.listen(this.port, "0.0.0.0", () => {
			console.log(`本地视频转发服务已启动 端口:${this.port}`);
		});
	}

	search(res: any, name?: string) {
		res.writeHead(200, { "Content-Type": "application/json" });

		if (!name) {
			//返回json
			res.end(JSON.stringify({ success: false, msg: "没有文件名" }));
			return;
		}
		//转义
		name = decodeURIComponent(name);
		console.log("搜索文件:", name);
		const app = MyPlugin.App;
		const files = app.vault.getFiles();
		let tfile: TFile | undefined = undefined;
		for (let file of files) {
			if (file.name.match(new RegExp(name, "g"))) {
				//判读时间
				if (!tfile || file.stat.ctime > tfile.stat.ctime) {
					tfile = file;
				}
				// console.log("找到文件:", file);
				//return
			}
		}
		if (tfile) {
			res.end(
				JSON.stringify({
					success: true,
					data: {
						path: OFile.localPath(tfile.path),
						name: tfile.name,
						folder: OFile.localPath(tfile.parent?.path ?? ""),
					},
				})
			);
		} else
			res.end(
				JSON.stringify({ success: false, msg: "没有找到文件", name })
			);
	}

	stopServer() {
		if (this.server) {
			this.server.close();
			this.server = null;
		}
	}
}
