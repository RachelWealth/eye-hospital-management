import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { Readable, Writable } from 'stream';

import 'colors';
import mime from 'mime';
import lodash from 'lodash';
import { v1 as uuid } from 'uuid';
import uniqid from 'uniqid';
import { format as dateFormat } from 'date-fns';

import HTTP_STATUS_CODE from './http-status-codes.js';

const autoIdMap = new Map();

const util = {

    ...lodash,

    is2DArrays(value) {
        return util.isArray(value) && (!value[0] || (util.isArray(value[0]) && util.isArray(value[value.length - 1])));
    },

    uuid: (separator = true) => separator ? uuid() : uuid().replace(/\-/g, ""),

    uniqid,

    autoId: (prefix = "") => {
        let index = autoIdMap.get(prefix);
        if(index > 999999) index = 0;  //超过最大数字则重置为0
        autoIdMap.set(prefix, (index || 0) + 1);
        return `${prefix}${index || 1}`;
    },

    getResponseContentType(value) {
        return value.headers ? (value.headers["content-type"] || value.headers["Content-Type"]) : null;
    },

    mimeToExtension(value) {
        let extension = mime.getExtension(value);
        if(extension == "mpga")
            return "mp3";
        return extension;
    },

    extractURLExtension(value) {
        const extname = path.extname(new URL(value).pathname);
        return extname.substring(1).toLowerCase();
    },

    optionsInject(that, options, initializers = {}, checkers = {}) {
        Object.keys(that).forEach(key => {
            if (/^\_/.test(key)) return;
            let value = options[key];
            if (util.isFunction(initializers[key]))
                value = initializers[key](value);
            if (util.isFunction(checkers[key]) && !checkers[key](value))
                throw new Error(`parameter ${key} invalid`);
            if ((!util.isFunction(initializers[key]) && !util.isFunction(checkers[key])) || util.isUndefined(value))
                return;
            if (util.isSymbol(that[key]) && !util.isSymbol(value))
                return;
            that[key] = value;
        });
    },

    getDateString(format = "yyyy-MM-dd", date = new Date()) {
        return dateFormat(date, format);
    },

    getIPAddressesByIPv4() {
        const interfaces = os.networkInterfaces();
        const addresses = [];
        for (let name in interfaces) {
            const networks = interfaces[name];
            const results = networks.filter(network => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal);
            if (results[0] && results[0].address)
                addresses.push(results[0].address);
        }
        return addresses;
    },

    getMACAddressesByIPv4() {
        const interfaces = os.networkInterfaces();
        const addresses = [];
        for (let name in interfaces) {
            const networks = interfaces[name];
            const results = networks.filter(network => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal);
            if (results[0] && results[0].mac)
                addresses.push(results[0].mac);
        }
        return addresses;
    },

    isLinux() {
        return os.platform() !== "win32";
    },
    
    isIPAddress(value) {
        return util.isString(value) && (/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value) || /\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*/.test(value));
    },

    isPort(value) {
        return util.isNumber(value) && value > 0 && value < 65536;
    },

    isReadStream(value) {
        return value && (value instanceof Readable || "readable" in value || value.readable);
    },

    isWriteStream(value) {
        return value && (value instanceof Writable || "writable" in value || value.writable);
    },

    isHttpStatusCode(value) {
        return util.isNumber(value) && Object.values(HTTP_STATUS_CODE).includes(value);
    },

    isURL(value) {
        return !util.isUndefined(value) && /^(http|https)/.test(value);
    },

    isSrc(value) {
        return !util.isUndefined(value) && /^\/.+\.[0-9a-zA-Z]+(\?.+)?$/.test(value);
    },

    isBASE64(value) {
        return !util.isUndefined(value) && /^[a-zA-Z0-9\/\+]+(=?)+$/.test(value);
    },

    isBASE64Image(value) {
        return /^data:image/.test(value);
    },

    extractBASE64ImageFormat(value) {
        const match = value.trim().match(/^data:image\/(.+);base64,/);
        if(!match) return null;
        return match[1];
    },

    removeBASE64ImageHeader(value) {
        return value.replace(/^data:image\/(.+);base64,/, "");
    },

    isDataString(value) {
        return /^(base64|json):/.test(value);
    },

    isStringNumber(value) {
        return util.isFinite(Number(value));
    },

    isUnixTimestamp(value) {
        return /^[0-9]{10}$/.test(`${value}`);
    },

    isTimestamp(value) {
        return /^[0-9]{13}$/.test(`${value}`);
    },

    isEmail(value) {
        return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(value);
    },

    isAsyncFunction(value) {
        return Object.prototype.toString.call(value) === "[object AsyncFunction]";
    },

    unixTimestamp() {
        return parseInt(Date.now() / 1000);
    },

    timestamp() {
        return Date.now();
    },

    urlJoin(...values) {
        let url = "";
        for (let i = 0; i < values.length; i++)
            url += `${i > 0 ? "/" : ""}${values[i].replace(/^\/*/, "").replace(/\/*$/, "")}`;
        return url;
    },

    millisecondsToHmss(milliseconds) {
        if (util.isString(milliseconds)) return milliseconds;
        milliseconds = parseInt(milliseconds);
        const sec = Math.floor(milliseconds / 1000);
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec - hours * 3600) / 60);
        const seconds = sec - hours * 3600 - minutes * 60;
        const ms = milliseconds % 60000 - seconds * 1000;
        return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}.${ms}`;
    },

    millisecondsToTimeString(milliseconds) {
        if(milliseconds < 1000)
            return `${milliseconds}ms`;
        if(milliseconds < 60000)
            return `${parseFloat((milliseconds / 1000).toFixed(2))}s`;
        return `${Math.floor(milliseconds / 1000 / 60)}m${Math.floor(milliseconds / 1000 % 60)}s`;
    },

    md5(value) {
        return crypto.createHash("md5").update(value).digest("hex");
    },

    crc32(value) {
        return util.isBuffer(value) ? CRC32.buf(value) : CRC32.str(value);
    },

    arrayParse(value) {
        util.isArray(value) ? value : [value];
    },

    booleanParse(value) {
        return value === "true" || value === true ? true : false
    },

    encodeBASE64(value) {
        return Buffer.from(value).toString("base64");
    },

    decodeBASE64(value) {
        return Buffer.from(value, "base64").toString();
    }

};

export default util;