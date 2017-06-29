/**
 * Checkpoint Provider
 */
import {Injectable} from '@angular/core';
import {OfflineCapableRestService} from '../services/offline.capable.rest.service';
import {RestDataProvider} from './rest.data.provider';
import {Checkpoint} from '../models/Checkpoint';
import {Promise} from '../../node_modules/bluebird'
import _ from "lodash";
import * as moment from 'moment';

@Injectable()
export class CheckpointProvider extends RestDataProvider
{
  database_name = "checkpoint";
  database_indices = [
    {
      name: 'idx_type',
      fields: ['type']
    },
    {
      name: 'idx_code',
      fields: ['code']
    },
    {
      name: 'idx_company',
      fields: ['account_id_c']
    },
    {
      name: 'idx_company_type',
      fields: ['account_id_c', 'type']
    }
  ];

  remote_table_name = "mkt_Checkpoint";


  constructor(protected offlineCapableRestService: OfflineCapableRestService)
  {
    super(offlineCapableRestService);

    let model = new Checkpoint();
    this.module_fields = model.getDefinedProperties();
  }

  /**
   *
   * @param {{}} options
   * @returns {Promise<Checkpoint>}
   */
  public getCheckpoint(options:any): Promise<Checkpoint>
  {
    let self = this;
    return new Promise(function (resolve, reject)
    {
      self.findDocuments(options).then((res) => {
        if(_.size(res.docs) < 1)
        {
          throw new Error("Checkpoint was not found!");
        }
        if (_.size(res.docs) > 1) {
          throw new Error("Multiple checkpoint were found!");
        }
        let checkpoint = new Checkpoint(res.docs[0]);
        resolve(checkpoint);
      }).catch((e) => {
        reject(e);
      });
    });
  }

  /**
   * Returns all IN and OUT type checkpoints
   *
   * @returns {Promise<any>}
   */
  public getInOutCheckpoints(): Promise<any>
  {
    let self = this;
    return new Promise(function (resolve, reject)
    {
      let findPromises = [];
      //@todo: for some reason index on 'type' does not work - when using combined selector
      findPromises.push(self.findDocuments({selector: {type: Checkpoint.TYPE_IN}}));
      findPromises.push(self.findDocuments({selector: {type: Checkpoint.TYPE_OUT}}));
        Promise.all(findPromises).then((res) =>
      {
        let answer = [];
        _.each(res, function(obj){
          answer = _.concat(answer, obj.docs);
        });
        resolve(answer);
      }).catch((e) =>
      {
        console.error(e);
        reject(e);
      });
    });
  }

  /**
   *
   * @returns {Promise<any>}
   */
  public syncWithRemote(): Promise<any>
  {
    let self = this;
    let batchSize = 50;
    let forceUpdate = false;

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
            order_by: 'code ASC',
            max_results: batchSize,
            offset: offset
          }).then((res) =>
          {
            //console.log("CHECKPOINT LIST["+sequence+"]["+offset+"]", res);
            sequence++;
            hasMore = (res.next_offset < res.total_count) && _.size(res.entry_list) > 0;

            if (!_.isEmpty(res.entry_list))
            {
              let documents = [];
              _.each(res.entry_list, function (remoteData)
              {
                documents.push(new Checkpoint(remoteData));
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
          console.log("Checkpoint provider synced: " + res.doc_count + " records");
          resolve();
        });
      }).catch((e) =>
      {
        console.error(e);
        reject(e);
      });
    });
  }

  /**
   * @returns {Promise<any>}
   */
  public initialize(): Promise<any>
  {
    //super.initialize();
    let self = this;
    return new Promise(function (resolve, reject)
    {
      self.setupDatabase().then(() =>
      {
        resolve();
      }).catch((e) =>
      {
        reject(e);
      });
    });
  }
}
