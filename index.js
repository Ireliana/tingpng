const path = require("path");
const fs = require("fs");
const tinify = require("tinify");
const Ora = require("ora");

// 填写 tinypng官网注册的 key
tinify.key = "";

const keySpinner = new Ora("Key校验中");

keySpinner.start();

tinify
	.validate()
	.then(() => {
		keySpinner.succeed("Key认证成功！");

		//默认每月可压缩图片数为500
		const totalCount = 500;

		// 需要压缩的图片数组
		const imgArray = [];

		// 图片所在目录,默认为img
		const imgdir = "./img";

		// 当前压缩进度
		let step = 0;

		const stepSpinner = new Ora("");

		let restCount = totalCount - tinify.compressionCount;
		if (restCount <= 0) {
			stepSpinner.fail("当前Key压缩次数已用完，请更换Key！");
			return;
		}

		stepSpinner.text = "正在检测png图";
		stepSpinner.start();
		mapDirName(imgdir);

		if (restCount < imgdir.length) {
			stepSpinner.fail("当前Key可用次数不足，请更换Key！");
			return;
		}
		imgArray.map(img => compressImg(img));

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
					mapDirName(name, imgArray);
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
					stepSpinner.text = `正在压缩，当前进度为：${currStep}%`;
					if (currStep === 100) {
						stepSpinner.succeed(
							`压缩完成，剩余可用次数为${totalCount -
								tinify.compressionCount}`
						);
					}
				})
				.catch(err => {
					if (err instanceof tinify.AccountError) {
						stepSpinner.fail(
							`当前Key的剩余次数不足：${err.message}`
						);
					} else if (err instanceof tinify.ClientError) {
						stepSpinner.fail("客户端发生错误，请稍后重试！");
					} else if (err instanceof tinify.ServerError) {
						stepSpinner.fail("服务端发生错误，请稍后重试！");
					} else if (err instanceof tinify.ConnectionError) {
						stepSpinner.fail("连接失败，请稍后重试！");
					} else {
						stepSpinner.fail("发生未知错误！");
					}
				});
		}
	})
	.catch(error => {
		keySpinner.fail(`未知错误：${error}`);
	});
