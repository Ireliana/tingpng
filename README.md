## 基于 [tinyPNG](https://tinypng.com/) 和 `Node.js`图片压缩工具

### 使用 `tinyPNG` 提供的 [Node.js](https://tinypng.com/developers/reference/nodejs) 接口，实现图片上传压缩

### 使用步骤
 * 先申请开发者 [API Key](https://tinypng.com/developers)，每个 `Key` 可压缩图片为 500张/月
 * 将 `API Key` 填入 `index.js` 文件中
 * 通过 `yarn start` 或者 `node index.js` 命令开启压缩，默认图片路径是 `./img`，可通过命令行参数 `--path xxx` 传入指定路径