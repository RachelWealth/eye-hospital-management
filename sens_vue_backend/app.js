"use strict";

import './lib/prototype.js';
import environment from './lib/environment.js';
import config from './lib/config.js';
import './lib/initialize.js';
import Server from './server/Server.js';
import routes from './routes/index.js';
import logger from './lib/logger.js';
import util from './lib/util.js';

const startupTime = util.timestamp();

(async () => {    

    logger.header();

    logger.info("version:", environment.package.version);
    logger.info("process id:", process.pid);
    logger.info("environment:", environment.env);
    logger.info("service name:", config.service.name);
    
    const server = new Server({ config: config.service, requestBodyConfig: config.system.requestBody });
    server.init();  //初始化服务器
    server.attachRoutes(routes);  //挂载路由
    await server.listen();

    config.service.bindAddress && logger.success("service bind address:", config.service.bindAddress);

    process.on("uncaughtException", (err, origin) => {
        logger.error(`An unhandled error occurred: ${origin}`, err);
    });  //输出未捕获异常
    process.on("unhandledRejection", (_, promise) => {
        promise.catch(err => logger.error("An unhandled rejection occurred:", err));
    });  //输出未处理的Promise.reject
    process.on("warning", warning => logger.warn("System warning: ", warning));
    process.on("exit", () => {
        logger.info("service exit");
        logger.footer();
    });  //进程退出事件
    process.on("SIGTERM", () => {
        logger.warn("received kill signal");
        process.exit(2);
    });  //kill退出进程
    process.on("SIGINT", () => {
        process.exit(0);
    });  //主动退出进程

})()
.then(() => logger.success(`service startup completed (${util.millisecondsToTimeString(util.timestamp() - startupTime)})`))
.catch(err => {
    logger.fatal("system error:", err);
    process.exit(1);  //发生严重错误时退出进程
});