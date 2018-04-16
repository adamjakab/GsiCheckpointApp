/* Import: Core */
import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
/* Import: services */
import {LogService} from "../../services/log.service";
import {UserService} from '../../services/user.service';
import {CodeScanService} from '../../services/code.scan.service';
import {RemoteDataService} from "../../services/remote.data.service";
/* Import: pages */
import {HomeNoConfPage} from './home-no-conf/home-no-conf';
import {HomeCodeRegPage} from './home-code-reg/home-code-reg';
import {HomeCodeChecklistPage} from "./home-code-checklist/home-code-checklist";
import {HomeCheckinlistPage} from './home-checkinlist/home-checkinlist';
import {ConfigurationPage} from "../configuration/configuration";
import {Checkpoint} from "../../models/Checkpoint";
import {HomePausePage} from "./home-pause/home-pause";
/* Import: utilities */

//import _ from "lodash";

@Component({
  selector: 'page-home',
  template: `
    <ion-content text-center>
      <!--<button ion-button margin-top color="not-so-danger" (click)="testActionOne()">-->
      <!--Test-->
      <!--</button>-->
      <div class="spinner">
        <img width="71" height="61" src="assets/image/spinner.gif"/>
      </div>
    </ion-content>
  `
})
export class HomePage implements OnInit
{
  constructor(protected navCtrl: NavController
    , protected codeScanService: CodeScanService
    , protected remoteDataService: RemoteDataService
    , protected userService: UserService)
  {
  }

  /**
   * @todo: remove me!
   */
  testActionOne(): void
  {
    this.navCtrl.push(HomeNoConfPage).then(() => {
      this.navCtrl.setRoot(HomeNoConfPage);
    });
  }

  /**
   * @description Check if application has been configured for use
   *
   * @var self.userService.is_user_configured
   *
   * @returns {Promise<any>}
   */
  private ___route___config_check(): Promise<any>
  {
    let self = this;
    return new Promise((resolve, reject) => {
      if (!self.userService.is_user_configured)
      {
        self.navCtrl.setRoot(HomeNoConfPage);
        return reject(new Error("L'applicazione non è stata ancora configurata."));
      } else
      {
        resolve();
      }
    });
  }

  /**
   * @description Check if user has initiated a new code registration
   *
   * @var self.userService.is_user_configured
   *
   * @returns {Promise<any>}
   * @private
   */
  private ___route___code_registration(): Promise<any>
  {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.codeScanService.isCodeScanInProgress())
      {
        this.navCtrl.setRoot(HomeCodeRegPage);
        return reject(new Error("Code registration in progress..."));
      } else
      {
        resolve();
      }
    });
  }

  /**
   * @description Check if there is a code(new|existing) on which user requested checklist modification
   *
   * @returns {Promise<any>}
   * @private
   */
  private ___route___code_checklist(): Promise<any>
  {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.remoteDataService.getCheckinToModify())
      {
        this.navCtrl.setRoot(HomeCodeChecklistPage);
        return reject(new Error("Checkin modification in progress..."));
      } else
      {
        resolve();
      }
    });
  }

  /**
   * @description Check if user is having a break
   *
   * @returns {Promise<any>}
   */
  ___route___user_break(): Promise<any>
  {
    let self = this;
    return new Promise((resolve, reject) => {
      let is_paused = false;
      try
      {
        is_paused = self.remoteDataService.getLastOperation().type == Checkpoint.TYPE_PAUSE;
      } catch (e)
      {
        is_paused = false;
      }

      if (is_paused)
      {
        this.navCtrl.setRoot(HomePausePage);
        return reject(new Error("User is having a break..."));
      } else
      {
        resolve();
      }
    });
  }

  ngOnInit(): void
  {
    LogService.log("*** HOME INIT START ***");
    this.remoteDataService.updateCurrentSessionCheckins().then(() => {
      return this.___route___config_check();
    }).then(() => {
      return this.___route___code_registration();
    }).then(() => {
      return this.___route___code_checklist();
    }).then(() => {
      return this.___route___user_break();
    }).then(() => {
      return this.navCtrl.setRoot(HomeCheckinlistPage);
    }).then(() => {
      LogService.log("*** HOME INIT DONE ***");
    }).catch(e => {
      LogService.error(e, "HOME INIT REJECTION");
    });
  }
}
