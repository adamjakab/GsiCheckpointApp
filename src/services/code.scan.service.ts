/**
 * Created by jack on 05/06/17.
 */
import {Injectable} from '@angular/core';
import {Platform} from "ionic-angular";
import {RemoteDataService} from './remote.data.service';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';

import {Checkpoint} from '../models/Checkpoint';


import _ from "lodash";


@Injectable()
export class CodeScanService
{
  public static readonly BARCODE_TYPE_QR : string    = "QR_CODE";

  private isMobileDevice:boolean;

  private _isCodeScanInProgress:boolean = false;
  private _scannedCodeToRegister:string = null;

  /**
   * Constructor
   */
  constructor(private barcodeScanner:BarcodeScanner
  , private platform:Platform
  , private remoteDataService:RemoteDataService )
  {
    this.isMobileDevice = !this.platform.is("core");
  }

  /**
   *
   *
   * @param {any} options
   * @returns {Promise<string>}
   */
  public scanQR(options={}):Promise<string>
  {
    let self = this;
    return new Promise(function (resolve, reject)
    {
      if(!self.isCodeScanInProgress())
      {
        self.setCodeScanInProgress(true);
        self.scan(options).then((barcodeData) => {
          if(barcodeData.format != CodeScanService.BARCODE_TYPE_QR)
          {
            self.setCodeScanInProgress(false);
            reject(new Error("The scanned image is not a QR Code!"));
          }
          self.setCodeToRegister(barcodeData.text);
          resolve(barcodeData.text);
        }, (e) => {
          self.setCodeScanInProgress(false);
          reject(e);
        });
      } else
      {
        //this should not happen at all
        reject(new Error("Code scan is already in progress!"));
      }
    });
  }

  /**
   *
   * now passing: {allowed_types:[]}
   *
   * @param {any} options
   * @returns {Promise<any>}
   */
  public scan(options={}):Promise<any>
  {
    let self = this;

    return new Promise(function (resolve, reject)
    {
      if(self.isMobileDevice)
      {
        self.barcodeScanner.scan(options).then((barcodeData) => {
          try {
            self.scanCheck(barcodeData, options);

            resolve(barcodeData);
          } catch(e)
          {
            reject(e);
          }
        }, (e) => {
          reject(e);
        });
      } else {
        let barcodeData = self.getFakeQRCode(options);
        try {
          self.scanCheck(barcodeData, options);
          resolve(barcodeData);
        } catch(e)
        {
          reject(e);
        }
      }
    });
  }

  /**
   * @param {any} barcodeData
   * @param {any} options
   * @throws Error
   */
  private scanCheck(barcodeData:any, options:any): void
  {
    let allowed_types:any = _.has(options, "allowed_types")
      ? _.get(options, "allowed_types") as any
      : [];

    // expected_type must be defined
    if(_.isEmpty(allowed_types))
    {
      throw new Error("Scan check: Allowed types are not defined!");
    }

    // Barcode sanity check
    if(_.isEmpty(barcodeData) || _.isUndefined(barcodeData.text) || _.isEmpty(barcodeData.text))
    {
      throw new Error("Codice scansionato non valido: " + JSON.stringify(barcodeData));
    }
  }

  /**
   * If allowed_types contains more than one type the FIRST type will be used
   *
   * @param {any} options
   * @returns {{format: string, cancelled: boolean, text: string}}
   */
  private getFakeQRCode(options:any):any
  {
    let allowed_types:any = _.has(options, "allowed_types")
      ? _.get(options, "allowed_types") as any
      : [Checkpoint.TYPE_CHK];
    let expected_type = _.first(allowed_types) as string;

    let codes:any = [];
    codes[Checkpoint.TYPE_IN] = ["CSI-IN"];
    codes[Checkpoint.TYPE_OUT] = ["CSI-OUT"];
    //codes[Checkpoint.TYPE_CHK] = ["108", "142", "211", "274", "AT03", "ES12"];//normali
    //codes[Checkpoint.TYPE_CHK] = ["151", "360", "AT61"];//bagni
    //codes[Checkpoint.TYPE_CHK] = ["124", "248", "A158", "AT76", "S103"];
    codes[Checkpoint.TYPE_CHK] = ["124", "AT76"];//"AT76",

    let allowFakes = codes[expected_type];

    let code = _.sample(allowFakes);
    //console.log("Not mobile - faking("+expected_type+"): "+JSON.stringify(allowFakes)+"...: " + code);

    return {
      format: CodeScanService.BARCODE_TYPE_QR,
      cancelled: false,
      text: code
    }
  }

  /**
   *
   * @returns {string}
   */
  public getScannedCodeToRegister()
  {
    return this._scannedCodeToRegister;
  }

  public isCodeScanInProgress(): boolean
  {
    return this._isCodeScanInProgress;
  }

  /**
   * @param {boolean} value
   */
  public setCodeScanInProgress(value: boolean)
  {
    if(value === false)
    {
      this.setCodeToRegister(null);
    }
    this._isCodeScanInProgress = value;
  }

  /**
   * Set the code to check for wehn registering/modifying(checklist)
   * @param {any} value
   */
  public setCodeToRegister(value:any):void
  {
    this._scannedCodeToRegister = !_.isEmpty(value) ? value : null;
  }
}

