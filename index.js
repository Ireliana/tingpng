const path = require("path");
const fs = require("fs");
const readline = require("readline");
const tinify = require("tinify");

// 填写 tingpng官网注册的 key
tinify.key = "";

//默认每月可压缩图片数为500
const totalCount = 500;

// 需要压缩的图片数组
const imgArray = [];

// 当前进度
let step = 0;

// 图片所在目录,默认为img
const imgdir = "./img";

tinify
	.validate()
	.then(() => {
		let restCount = totalCount - tinify.compressionCount;
		if (restCount <= 0) {
			console.log("\n当前Key压缩次数已用完，请更换Key！");
			return;
		}
		console.log(
			`\n当前Key剩余次数为${totalCount - tinify.compressionCount}次`
		);
		mapDirName(imgdir);
		imgArray.map(img => compressImg(img));
	})
	.catch(error => {
		console.log("\nKey认证失败，请重新检查填写！");
	});

function mapDirName(dirName) {
	let reg = /.*\/(.*)\.png$/;
	const imgFiles = fs.readdirSync(path.resolve(__dirname, dirName));
	if (!imgFiles || imgFiles.length === 0) {
		return;
	}
	for (let i = 0; i < imgFiles.length; i++) {
		let name = `${dirName}/${imgFiles[i]}`;
		let stats = fs.statSync(name);
		if (stats.isDirectory()) {
			mapDirName(name);
		} else if (reg.exec(name)) {
			imgArray.push(name);
		}
	}
}

function compressImg(img) {
	let source = tinify.fromFile(img);
	return source
		.toFile(img)
		.then(() => {
			step++;
			let currStep = Math.floor((step / imgArray.length) * 100);
			readline.clearLine(process.stdout, 0);
			readline.cursorTo(process.stdout, 0, 3);
			process.stdout.write(`正在压缩，当前进度为：${currStep}%`);
			if (currStep === 100) {
				console.log("\n\n压缩完成！");
			}
		})
		.catch(err => {
			if (err instanceof tinify.AccountError) {
				console.log("\n当前Key的剩余次数不足：" + err.message);
			} else if (err instanceof tinify.ClientError) {
				console.log("\n客户端发生错误，请稍后重试！");
			} else if (err instanceof tinify.ServerError) {
				console.log("\n服务端发生错误，请稍后重试！");
			} else if (err instanceof tinify.ConnectionError) {
				console.log("\n连接失败，请稍后重试！");
			} else {
				console.log("\n发生未知错误！");
			}
		});
}
