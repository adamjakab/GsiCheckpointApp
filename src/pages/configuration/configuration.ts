import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, ToastController, LoadingController} from 'ionic-angular';
import {ConfigurationService} from '../../services/configuration.service';
import {UserService} from '../../services/user.service';
import {RemoteDataService} from '../../services/remote.data.service';
import { BackgroundService } from "../../services/background.service";
import {OfflineCapableRestService} from '../../services/offline.capable.rest.service';
import {ConfigurationUnlockerPage} from './configuration.unlocker';
import {HomePage} from "../home/home";
import _ from "lodash";
import {LogService} from "../../services/log.service";


@Component({
  selector: 'page-configuration',
  templateUrl: 'configuration.html'
})
export class ConfigurationPage implements OnInit
{
  cfg: any;
  viewIsReady: boolean;

  constructor(public navCtrl: NavController
    , private toastCtrl: ToastController
    , public modalCtrl: ModalController
    , private loadingCtrl: LoadingController
    , private configurationService: ConfigurationService
    , private userService: UserService
    , private remoteDataService: RemoteDataService
    , private backgroundService: BackgroundService
    , public offlineCapableRestService: OfflineCapableRestService)
  {
    this.viewIsReady = false;
  }



  /**
   * !!! NETWORK CONNECTION REQUIRED !!!
   * destroy and recreate databases and load remote data
   */
  cleanCache(): void
  {
    if (!this.offlineCapableRestService.isNetworkConnected())
    {
      let toast = this.toastCtrl.create({
        message: "Nessuna connessione! Connettiti alla rete e riprova.",
        duration: 5000,
        position: 'top'
      });
      toast.present();
      return;
    }

    let loaderContent = "<strong>Eliminazione cache</strong><br />";
    let msg;

    let loader = this.loadingCtrl.create({
      content: loaderContent,
      duration: (5 * 60 * 1000)
    });

    loader.present().then(() =>
    {
      msg = "Stopping background service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.backgroundService.stop();
    }).then(() =>
    {
      msg = "Logging out user...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.logout();
    }).then(() =>
    {
      msg = "Initializing user service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.initialize();
    }).then(() =>
    {
      msg = "Logging in user...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.login(this.cfg.crm_username, this.cfg.crm_password);
    }).then(() =>
    {
      msg = "Destroying databases...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.remoteDataService.destroyLocalDataStorages();
    }).then(() =>
    {
      msg = "Initializing remote data service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.remoteDataService.initialize(true);
    }).then(() =>
    {
      msg = "Starting background service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.backgroundService.start();
    }).then(() =>
    {
      msg = "Cache cleared.";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      this.navCtrl.push(HomePage);
      this.navCtrl.setRoot(HomePage);
      loader.dismiss();
    }).catch((e) => {
      let toast = this.toastCtrl.create({
        message: e,
        duration: 15000,
        position: 'top'
      });
      toast.present().then(() => {
        LogService.log("Cache clean error: " + e);
        loader.dismiss();
      });
    });
  }


  /**
   * !!! NETWORK CONNECTION REQUIRED !!!
   * destroy and recreate databases and load remote data
   */
  cleanCacheOld(): void
  {
    if (!this.offlineCapableRestService.isNetworkConnected())
    {
      let toast = this.toastCtrl.create({
        message: "Nessuna connessione! Connettiti alla rete e riprova.",
        duration: 5000,
        position: 'top'
      });
      toast.present();
      return;
    }

    let loaderContent = "<strong>Eliminazione cache</strong><br />";
    let msg;

    let loader = this.loadingCtrl.create({
      content: loaderContent,
      duration: (5 * 60 * 1000)
    });

    loader.present().then(() =>
    {
      msg = "Stopping background service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.backgroundService.stop();
    }).then(() =>
    {
      msg = "Logging out user...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.logout();
    }).then(() =>
    {
      msg = "Initializing user service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.initialize();
    }).then(() =>
    {
      msg = "Logging in user...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.login(this.cfg.crm_username, this.cfg.crm_password);
    }).then(() =>
    {
      msg = "Initializing user service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.userService.initialize();
    }).then(() =>
    {
      msg = "Destroying databases...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.remoteDataService.destroyLocalDataStorages();
    }).then(() =>
    {
      msg = "Initializing remote data service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.remoteDataService.initialize(true);
    }).then(() =>
    {
      msg = "Starting background service...";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      return this.backgroundService.start();
    }).then(() =>
    {
      msg = "Cache cleared.";
      LogService.log(msg);
      loader.setContent(loaderContent + msg);
      this.navCtrl.push(HomePage);
      this.navCtrl.setRoot(HomePage);
      loader.dismiss();
    }).catch((e) => {
      let toast = this.toastCtrl.create({
        message: e,
        duration: 15000,
        position: 'top'
      });
      toast.present().then(() => {
        LogService.log("Cache clean error: " + e);
        loader.dismiss();
      });
    });
  }



  /**
   * Save configuration values and reset application
   */
  saveAndResetApplication(): void
  {
    if(!this.offlineCapableRestService.isNetworkConnected())
    {
      let toast = this.toastCtrl.create({
        message: "Nessuna connessione! Connettiti alla rete e riprova.",
        duration: 5000,
        position: 'top'
      });
      toast.present();
      return;
    }

    let self = this;
    let loader = this.loadingCtrl.create({
      content: "Elaborazione in corso...",
      duration: (5 * 60 * 1000)
    });
    loader.present().then(() =>
    {
      LogService.log("Stopping background service...");
      return this.backgroundService.stop();
    }).then(() =>
    {
      //save all config values
      let setPromises = [];
      _.each(this.cfg, function (val, key)
      {
        setPromises.push(self.configurationService.setConfig(key, val));
      });

      Promise.all(setPromises).then(() =>
      {
        this.configurationService.unlockWithCode("");//lock it
        LogService.log("Configuration values were saved.");

        return this.userService.logout();
      }).then(() =>
      {
        LogService.log("User is now logged out.");

        return this.userService.login(this.cfg.crm_username, this.cfg.crm_password);
      }).then(() =>
      {
        LogService.log("User is now logged in.");
        return this.userService.initialize();
      }).then(() =>
      {
        LogService.log("Starting background service...");
        return this.backgroundService.start();
      }).then(() =>
      {
        return loader.dismiss();
      }).then(() =>
      {
        LogService.log("APPLICATION RESET OK");
        self.cleanCache();
      }).catch((e) =>
      {
        loader.dismiss().then(() =>
        {
          LogService.log("Application reset error: " + e);
          let toast = this.toastCtrl.create({
            message: 'Errore configurazione app! ' + e,
            duration: 15000,
            position: 'top'
          });
          toast.present();
        });
      });
    });
  }

  /**
   * Ask user for unlock code and attempt to unlock the configuration service
   */
  onUnlockConfigForm(): void
  {
    let unlockModal = this.modalCtrl.create(ConfigurationUnlockerPage, false, {});
    unlockModal.onDidDismiss(data =>
    {
      let unlock_code = _.get(data, "unlock_code", "");
      this.configurationService.unlockWithCode(unlock_code);
      if (!this.configurationService.isUnlocked())
      {
        let toast = this.toastCtrl.create({
          message: 'Codice sblocco errato!',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    });
    unlockModal.present();
  }

  /**
   * Lock the configuration service
   */
  onLockConfigForm(): void
  {
    this.configurationService.unlockWithCode("");
  }

  /**
   *
   * @returns {boolean}
   */
  isFormDisabled(): boolean
  {
    return !this.configurationService.isUnlocked();
  }

  /**
   *
   */
  private getConfiguration(): void
  {
    this.configurationService.getConfigObject().then((config) =>
    {
      this.cfg = config;
      this.viewIsReady = true;
    }).catch((e) =>
    {
      this.cfg = {};
    });
  }

  ngOnInit(): void
  {
    this.getConfiguration();
  }
}
