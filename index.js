const path = require("path");
const fs = require("fs");

var tinify = require("tinify");
tinify.key = "XxpVMFwq2QDyS0MQ8WbCrXHW67sJgZG3";
let totalCount = 500;

tinify
	.validate()
	.then(() => {
		let restCount = totalCount - tinify.compressionCount;
		if (restCount <= 0) {
			console.log("当前Key压缩次数已用完，请更换Key！");
			return;
		}
		console.log(
			`当前Key剩余次数为${totalCount - tinify.compressionCount}次`
		);
		mapDirName("./img");
	})
	.catch(error => {
		console.log("Key认证失败！");
	});

function mapDirName(dirName) {
	const imgFiles = fs.readdirSync(path.resolve(__dirname, dirName));
	if (!imgFiles || imgFiles.length === 0) {
		return;
	}
	console.log("正在压缩，请等待...");
	for (let i = 0; i < imgFiles.length; i++) {
		let name = `${dirName}/${imgFiles[i]}`;
		let stats = fs.statSync(name);
		if (stats.isDirectory()) {
			mapDirName(name);
		} else {
			compressImg(name);
		}
	}
}

function compressImg(img) {
	let reg = /.*\/(.*)\.png$/;
	let result = null;
	if ((result = reg.exec(img))) {
		// let rename = img.replace(result[1], "__" + result[1]);
		let source = tinify.fromFile(img);
		return source.toFile(img).catch(err => {
			if (err instanceof tinify.AccountError) {
				console.log("当前Key的剩余次数可能不足：" + err.message);
			} else if (err instanceof tinify.ClientError) {
				console.log("客户端发生错误，请稍后重试！");
			} else if (err instanceof tinify.ServerError) {
				console.log("服务端发生错误，请稍后重试！");
			} else if (err instanceof tinify.ConnectionError) {
				console.log("连接失败，请稍后重试！");
			} else {
				console.log("发生未知错误！");
			}
		});
	}
}
