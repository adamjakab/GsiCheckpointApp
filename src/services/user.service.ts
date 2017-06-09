/**
 * Created by jack on 05/06/17.
 */
import {Injectable} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {RestService} from './rest.service';
import {RemoteDataService} from './remote.data.service';
import _ from "lodash";
import md5 from '../../node_modules/blueimp-md5';

@Injectable()
export class UserService
{
  private authenticated: boolean = false;
  private user_data: any = {};

  //@todo: make sure this is disabled before deployment ;)
  private autologin: any = {
    autologin: true,
    autologin_user: 'admin',
    autologin_pwd: 'admin',
  };

  constructor(private configurationService: ConfigurationService
    , private restService: RestService
    , private remoteDataService: RemoteDataService)
  {
  }

  /**
   *
   * @returns {boolean}
   */
  isAuthenticated(): boolean
  {
    return this.authenticated;
  }

  /**
   *
   * @param {string} key
   * @returns {any}
   */
  getUserData(key: string): any
  {
    let answer;
    if (_.has(this.user_data, key))
    {
      answer = _.get(this.user_data, key);
    } else if (key == '*')
    {
      answer = this.user_data;
    } else
    {
      answer = '';
    }

    return answer;
  }

  /**
   *
   * @returns {Promise<any>}
   */
  logout(): Promise<any>
  {
    let self = this;
    console.log("Logging out...");
    return new Promise(function (resolve)
    {
      self.restService.logout().then(() =>
      {
        self.authenticated = false;
        self.user_data = {};
        resolve();
      }).catch((e) =>
      {
        console.log("LOGOUT ERROR! " + e);
        self.authenticated = false;
        self.user_data = {};
        resolve();
      });
    });
  }

  /**
   *
   * @param {string} username
   * @param {string} password
   *
   * @returns {Promise<any>}
   */
  login(username: string, password: string): Promise<any>
  {
    let self = this;
    console.log("Authenticating user: " + username);
    return new Promise(function (resolve, reject)
    {
      self.restService.login(username, password).then((res) =>
      {
        self.user_data = self.restService.getAuthenticatedUser();
        self.user_data.id = self.user_data.user_id;
        return self.restService.getEntry('Users', self.user_data.id);
      }).then((user_full_data) =>
      {
        user_full_data = _.head(user_full_data.entry_list);
        _.assignIn(self.user_data, user_full_data);
        //Register user hash
        return self.remoteDataService.registerUserHash(username, md5(password));
      }).then(() =>
      {
        self.authenticated = true;
        resolve();
      }).catch((e) =>
      {
        console.log("LOGIN ERROR! " + e);
        reject(e);
      });
    });
  }

  /**
   * initialize the Rest service
   */
  initialize(): Promise<any>
  {
    let self = this;


    return new Promise(function (resolve, reject)
    {
      let cfg: any, rest_api_url: string, rest_api_version: string;

      self.configurationService.getConfigObject()
        .then((value) =>
        {
          cfg = value;
          self.restService.initialize(cfg.crm_url, cfg.api_version);
          if (!_.isUndefined(self.autologin) && !_.isUndefined(self.autologin.autologin) && self.autologin.autologin)
          {
            console.warn("EXECUTING AUTOLOGIN!");
            return self.login(self.autologin.autologin_user, self.autologin.autologin_pwd);
          } else
          {
            resolve();
          }
        })
        .then(() =>
        {
          resolve();
        })
        .catch((e) =>
        {
          reject(e);
        });
    });
  }

}


/*
 this.user_data:

 {
 "user_id":"1","user_name":"admin","user_language":"it_IT","user_currency_id":"-99","user_is_admin":true,
 "user_default_team_id":null,"user_default_dateformat":"d/m/Y","user_default_timeformat":"H:i",
 "user_number_seperator":".","user_decimal_seperator":",","mobile_max_list_entries":null,
 "mobile_max_subpanel_entries":null,"user_currency_name":"Euro","id":"1","module_name":"Users",
 "modified_by_name":"Administrator","created_by_name":"","user_hash":"","system_generated_password":"0",
 "pwd_last_changed":"","authenticate_id":"","sugar_login":"1",
 "first_name":"",
 "last_name":"Administrator",
 "full_name":"Administrator",
 "name":"Administrator",
 "is_admin":"1","external_auth_only":"0","receive_notifications":"1",
 "description":"","date_entered":"2017-05-12 13:42:51","date_modified":"2017-05-17 07:54:35","modified_user_id":"1",
 "created_by":"","title":"Administrator","photo":"","department":"","phone_home":"","phone_mobile":"",
 "phone_work":"","phone_other":"","phone_fax":"","status":"Active","address_street":"","address_city":"",
 "address_state":"","address_country":"","address_postalcode":"","UserType":"","deleted":"0","portal_only":"0",
 "show_on_employees":"1","employee_status":"Active","messenger_id":"","messenger_type":"","reports_to_id":"",
 "reports_to_name":"","email1":"hello@mekit.it","email_link_type":"","is_group":"0","c_accept_status_fields":"",
 "m_accept_status_fields":"","accept_status_id":"","accept_status_name":"","securitygroup_noninher_fields":"",
 "securitygroup_noninherit_id":"","securitygroup_noninheritable":"","securitygroup_primary_group":""
 }
 */
