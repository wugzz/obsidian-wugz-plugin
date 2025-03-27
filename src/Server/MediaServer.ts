import * as http from "http";
import * as fs from "fs";
import * as path from "path";

export class MediaServer {
	private server: http.Server | null = null;
	private port: number;

	constructor(port: number) {
		this.port = port;
	}

	startServer() {
		this.server = http.createServer((req, res) => {
			if (!req.url) {
				res.writeHead(400, { "Content-Type": "text/plain" });
				res.end("Bad Request");
				return;
			}

			const urlParams = new URLSearchParams(req.url.split("?")[1] || "");
			const filePath = urlParams.get("q");

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
			console.log(`Media server running on port ${this.port}`);
		});
	}

	stopServer() {
		if (this.server) {
			this.server.close();
			this.server = null;
		}
	}
}
