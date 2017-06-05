/**
 * Created by jack on 05/06/17.
 */
import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';

@Component({
  selector: 'page-configuration-unlocker',
  templateUrl: 'configuration.unlocker.html'
})
export class ConfigurationUnlockerPage
{
  unlock_code:string;

  constructor(public viewCtrl: ViewController)
  {
    this.unlock_code = "";
  }

  dismiss() {
    let data = { unlock_code: this.unlock_code };
    this.viewCtrl.dismiss(data);
  }
}
