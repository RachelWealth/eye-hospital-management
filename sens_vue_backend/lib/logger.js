import path from 'path';
import _util from 'util';

import 'colors';
import fs from 'fs-extra';
import { format as dateFormat } from 'date-fns';

import Base from './Base.js';
import SystemConfig from './configs/SystemConfig.js';
import config from './config.js';
import util from './util.js';

class LogWriter extends Base {

    config = {};
    #buffers = [];

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            config: SystemConfig.create
        }, {
            config: SystemConfig.isInstance
        });
        this.work();
    }

    push(content) {
        const buffer = Buffer.from(content);
        this.#buffers.push(buffer);
    }

    writeSync(buffer) {
        fs.appendFileSync(path.join(this.config.logDirPath, `/${util.getDateString()}.log`), buffer);
    }

    async write(buffer) {
        await fs.appendFile(path.join(this.config.logDirPath, `/${util.getDateString()}.log`), buffer);
    }

    flush() {
        if(!this.#buffers.length) return;
        fs.appendFileSync(path.join(this.config.logDirPath, `/${util.getDateString()}.log`), Buffer.concat(this.#buffers));
    }

    work() {
        if (!this.#buffers.length) return setTimeout(this.work.bind(this), this.config.logWriteInterval);
        const buffer = Buffer.concat(this.#buffers);
        this.#buffers = [];
        this.write(buffer)
        .finally(() => setTimeout(this.work.bind(this), this.config.logWriteInterval))
        .catch(err => console.error("log write error:", err));
    }

}

class LogText {

    level;  //日志级别
    text;  //日志文本
    source;  //日志来源
    time = new Date();  //日志发生时间

    constructor(level, ...params) {
        this.level = level;
        this.text = _util.format.apply(null, params);
        this.source = this.#getStackTopCodeInfo();
    }

    #getStackTopCodeInfo() {
        const unknownInfo = { name: "unknown", codeLine: 0, codeColumn: 0 };
        const stackArray = new Error().stack.split("\n");
        const text = stackArray[4];
        if (!text)
            return unknownInfo;
        const match = text.match(/at (.+) \((.+)\)/) || text.match(/at (.+)/);
        if (!match || !util.isString(match[2] || match[1]))
            return unknownInfo;
        const temp = match[2] || match[1];
        const _match = temp.match(/([a-zA-Z0-9_\-\.]+)\:(\d+)\:(\d+)$/);
        if (!_match)
            return unknownInfo;
        const [, scriptPath, codeLine, codeColumn] = _match;
        return {
            name: scriptPath ? scriptPath.replace(/.js$/, "") : "unknown",
            path: scriptPath || null,
            codeLine: parseInt(codeLine || 0),
            codeColumn: parseInt(codeColumn || 0)
        };
    }

    toString() {
        return `[${dateFormat(this.time, "yyyy-MM-dd HH:mm:ss.SSS")}][${this.level}][${this.source.name}<${this.source.codeLine},${this.source.codeColumn}>] ${this.text}`;
    }

}

class Logger extends Base {

    config = {};  //系统配置
    static Level = {
        Success: "success",
        Info: "info",
        Log: "log",
        Debug: "debug",
        Warning: "warning",
        Error: "error",
        Fatal: "fatal"
    };  //日志级别
    static LevelColor = {
        [Logger.Level.Success]: "green",
        [Logger.Level.Info]: "brightCyan",
        [Logger.Level.Debug]: "white",
        [Logger.Level.Warning]: "brightYellow",
        [Logger.Level.Error]: "brightRed",
        [Logger.Level.Fatal]: "red"
    };  //日志级别文本颜色
    #writer;  //日志写入器

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            config: SystemConfig.create
        }, {
            config: SystemConfig.isInstance
        });
        this.#writer = new LogWriter({ config: this.config });
    }

    header() {
        this.#writer.writeSync(Buffer.from(`\n\n===================== LOG START ${dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================\n\n`));
    }

    footer() {
        this.#writer.flush();  //将未写入文件的日志缓存写入
        this.#writer.writeSync(Buffer.from(`\n\n===================== LOG END ${dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================\n\n`));
    }

    success(...params) {
        const content = new LogText(Logger.Level.Success, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Success]]);
        this.#writer.push(content + "\n");
    }

    info(...params) {
        const content = new LogText(Logger.Level.Info, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Info]]);
        this.#writer.push(content + "\n");
    }

    log(...params) {
        const content = new LogText(Logger.Level.Log, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Log]]);
        this.#writer.push(content + "\n");
    }

    debug(...params) {
        if(!this.config.debug) return;  //非调试模式忽略debug
        const content = new LogText(Logger.Level.Debug, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Debug]]);
        this.#writer.push(content + "\n");
    }

    warn(...params) {
        const content = new LogText(Logger.Level.Warning, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Warning]]);
        this.#writer.push(content + "\n");
    }

    error(...params) {
        const content = new LogText(Logger.Level.Error, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Error]]);
        this.#writer.push(content);
    }

    fatal(...params) {
        const content = new LogText(Logger.Level.Fatal, ...params).toString();
        console.info(content[Logger.LevelColor[Logger.Level.Fatal]]);
        this.#writer.push(content);
    }

    destory() {
        this.#writer.destory();
    }

}

export default new Logger({ config: config.system });