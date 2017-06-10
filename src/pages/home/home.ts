import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {UserService} from '../../services/user.service';
import {RemoteDataService} from '../../services/remote.data.service';
import {CodeScanService} from '../../services/code.scan.service';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage  implements OnInit
{
  private lastScannedBarcode:string;

  constructor(public navCtrl: NavController
    , private userService: UserService
    , private codeScanService: CodeScanService
    , private remoteDataService: RemoteDataService
    )
  {
    console.log("HOME constructed!");

  }

  /**
   *
   * @param {string} expectedType
   */
  scanQRCode(expectedType:string):void
  {
    this.codeScanService.scanQR({expected_type:expectedType}).then((barcodeData) =>
    {
      this.lastScannedBarcode = JSON.stringify(barcodeData);

    }, (e) => {
      console.error("Error scanning barcode: " + e);
    });
  }



  /**
   *
   * @param {string} key
   * @returns {string}
   */
  getUserData(key:string):any
  {
    return this.userService.getUserData(key);
  }

  /**
   *
   * @returns {boolean}
   */
  isUserAuthenticated(): boolean
  {
    return this.userService.isAuthenticated();
  }

  /**
   *
   * @returns {boolean}
   */
  isConnected(): boolean
  {
    return this.remoteDataService.isNetworkConnected();
  }

  /**
   *
   * @returns {boolean}
   */
  isUserCheckedIn(): boolean
  {
    return this.remoteDataService.getLastOperationType() == RemoteDataService.CHECKPOINT_TYPE_IN;
  }

  ngOnInit():void
  {
    //

  }
}
