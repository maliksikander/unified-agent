import { Component, OnInit, HostBinding } from "@angular/core";
import { Router } from "@angular/router";
import { finesseService } from "./services/finesse.service";
import { isLoggedInService } from "./services/isLoggedIn.service";
import { sharedService } from "./services/shared.service";
import {OverlayContainer} from '@angular/cdk/overlay';
import { httpService } from "./services/http.service";
import { cacheService } from "./services/cache.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "unified-agent-gadget";
  @HostBinding('class') className = '';
  themeChange;


  currentRoute: string;

  constructor(private overlay: OverlayContainer,private _cacheService: cacheService, public _finesseService: finesseService, private _router: Router,private _httpService: httpService, private _isLoggedInservice: isLoggedInService, private _sharedService: sharedService) { }
  isdarkMode = false;

  ngOnInit() {
    this._router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentRoute = event.url;
      }
    });
    let customerSchema: any;
    let channelTypes: any;
    try {
      customerSchema = JSON.parse(localStorage.getItem("customerSchema"));
      channelTypes = JSON.parse(localStorage.getItem("channelTypes"));
    } catch (e) { }
    if (customerSchema) {
      this._sharedService.schema = customerSchema;
    }
    if (channelTypes) {
      this._sharedService.channelTypeList = channelTypes;
    }

   // this.checkForAppUpdates();

    // if (localStorage.getItem('darkTheme')) {
    //   this.isdarkMode = true;
    //   this.switchTheme(this.isdarkMode);
    // }
  }

  switchTheme(e) {
    this.themeChange = e;
    const darkClassName = 'darkMode';
    this.className = this.themeChange ? darkClassName : '';
    if (this.themeChange === true) {
      try {
        this._httpService.updateUserTheme({theme:"dark"},this._cacheService.agent.id).subscribe(
          (e)=>{
                console.log(`theme setting for user ${this._cacheService.agent.id} updated to`, e);
                if(e.theme=='dark')
                {
                  localStorage.setItem("darkTheme",e.theme);
                }
          }
    );
      } catch (e) {

      }
      this.overlay.getContainerElement().classList.add(darkClassName);
      try {
        localStorage.setItem('darkTheme', 'darkTheme');
      } catch (e) {

      }
    } else {
      try {
        localStorage.removeItem('darkTheme');
        this._httpService.updateUserTheme({theme:"light"},this._cacheService.agent.id).subscribe(
          (e)=>{
                console.log(`theme setting for user ${this._cacheService.agent.id} updated to`, e);
                if(e.theme=='dark')
                {
                  localStorage.setItem("darkTheme",e.theme);
                }
          }
    );
      } catch (e) {

      }
      console.log("removing dark theme",e);
      this.overlay.getContainerElement().classList.remove(darkClassName);
    }
  }

  // checks for the update of pwa app
  // checkForAppUpdates() {
  //  try{
  //   this.updates.available.subscribe((event) => {
  //     if (confirm("An update is available, please refresh the App to fetch updates")) {
  //       this.updates.activateUpdate().then(() => location.reload());
  //     }
  //   });
  // }catch(err){}
  // }

}
