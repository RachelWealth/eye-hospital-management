import { Response, SuccessfulBody } from './lib.js';
import mongodb from '../lib/mongodb.js';

export default {

    prefix: "/report",

    get: {

      "/list1": async request => {
        const db = mongodb.db('test');
        const col = db.collection('nrg');
        const reports = await (col.find({
            // 这里放过滤条件
        })).toArray();
        // 这里暂时截取了100条数据
        return new Response(new SuccessfulBody(reports.slice(0, 100)))
      },
"/list2": async request => {
      const db = mongodb.db('test');
      const col = db.collection('rg');
      const reports = await (col.find({
          // 这里放过滤条件
      })).toArray();
      // 这里暂时截取了100条数据
      return new Response(new SuccessfulBody(reports.slice(0, 100)))
    }
    },
    

}