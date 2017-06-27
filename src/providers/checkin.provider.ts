/**
 * Checkin Provider
 */
import {Injectable} from '@angular/core';
import {OfflineCapableRestService} from '../services/offline.capable.rest.service';
import {RestDataProvider} from './rest.data.provider';
import {Checkin} from '../models/Checkin';
import {Promise} from '../../node_modules/bluebird'
import _ from "lodash";
import * as moment from 'moment';

@Injectable()
export class CheckinProvider extends RestDataProvider
{
  database_name = "checkin";
  database_indices = [
    {
      name: 'idx_date',
      fields: ['checkin_date']
    }
  ];

  remote_table_name = "mkt_Checkin";

  constructor(protected offlineCapableRestService: OfflineCapableRestService)
  {
    super(offlineCapableRestService);

    let model = new Checkin();
    this.module_fields = model.getDefinedProperties();
  }

  /**
   *
   * @returns {Promise<any>}
   */
  public syncWithRemote(): Promise<any>
  {
    let self = this;
    let forceUpdate = false;
    let batchSize = 50;
    let maxRecords = 100;
    let recordCount = 0;

    return new Promise(function (resolve, reject)
    {
      let sequence = 0;
      let offset = 0;
      let hasMore = true;
      self.promiseWhile(hasMore, function (hasMore)
      {
        return hasMore;
      }, function (hasMore)
      {
        return new Promise(function (resolve, reject)
        {
          offset = sequence * batchSize;
          self.offlineCapableRestService.getEntryList(self.remote_table_name, {
            select_fields: self.module_fields,
            order_by: 'checkin_date ASC',
            max_results: batchSize,
            offset: offset
          }).then((res) =>
          {
            //console.log("CHECKIN LIST["+sequence+"]["+offset+"]", res);
            sequence++;
            recordCount += _.size(res.entry_list);
            hasMore = (res.next_offset < res.total_count) && (recordCount < maxRecords) && _.size(res.entry_list) > 0;
            if (!_.isEmpty(res.entry_list))
            {
              let documents = [];
              _.each(res.entry_list, function (remoteData)
              {
                documents.push(new Checkin(remoteData));
              });
              self.storeDocuments(documents, forceUpdate).then(() =>
              {
                resolve(hasMore);
              }).catch((e) =>
              {
                reject(e);
              });
            } else
            {
              resolve(hasMore);
            }
          })
        });
      }).then(() =>
      {
        self.getDatabaseInfo().then((res) =>
        {
          console.log("Checkin provider synced: " + res.doc_count + " records");
          resolve();
        });
      }).catch((e) =>
      {
        console.error(e);
      });
    });
  }

  /**
   * @returns {Promise<any>}
   */
  public initialize(): Promise<any>
  {
    let self = this;
    return new Promise(function (resolve, reject)
    {
      self.setupDatabase().then(() =>
      {
        return self.syncWithRemote();
      }).then(() =>
      {
        resolve();
      });
    });
  }
}
