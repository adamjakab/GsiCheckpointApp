import {BrowserModule} from "@angular/platform-browser";
import {ErrorHandler, NgModule} from "@angular/core";
import {FormsModule} from '@angular/forms';
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {MyApp} from "./app.component";

/* Ionic */
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
/*import {IonicStorageModule} from '@ionic/storage';*/
import {Network} from '@ionic-native/network';


/* Services */
import {ConfigurationService} from '../services/configuration.service';
import {RestService} from '../services/rest.service';
import {UserService} from '../services/user.service';
import {RemoteDataService} from '../services/remote.data.service';
import {CodeScanService} from '../services/code.scan.service';

/* Pages */
import {HomePage} from "../pages/home/home";
import {InfoPage} from "../pages/info/info";
import {LoginPage} from "../pages/login/login";
import {LogoutPage} from "../pages/logout/logout";
import {ConfigurationPage} from "../pages/configuration/configuration";
import {ConfigurationUnlockerPage} from "../pages/configuration/configuration.unlocker";

/* Other/Utils/Tools */

@NgModule({
  declarations: [
    MyApp
    , HomePage
    , InfoPage
    , LoginPage
    , LogoutPage
    , ConfigurationPage
    , ConfigurationUnlockerPage
  ],
  imports: [
    BrowserModule
    , FormsModule
    , IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
    , HomePage
    , InfoPage
    , LoginPage
    , LogoutPage
    , ConfigurationPage
    , ConfigurationUnlockerPage
  ],
  providers: [
    StatusBar
    , SplashScreen
    , BarcodeScanner
    , ConfigurationService
    , RestService
    , UserService
    , RemoteDataService
    , CodeScanService
    , Network
    , {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule
{}
