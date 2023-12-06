import fs from 'fs-extra';

import config from "./config.js";

process.setMaxListeners(Infinity);  //允许无限量的监听器

const { tmpDirPath, logDirPath } = config.system;

fs.ensureDirSync(tmpDirPath);  //创建临时目录
fs.ensureDirSync(logDirPath);  //创建日志目录
