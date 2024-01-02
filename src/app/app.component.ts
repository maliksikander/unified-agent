import {Component, OnInit, HostBinding, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { Router } from "@angular/router";
import { finesseService } from "./services/finesse.service";
import { isLoggedInService } from "./services/isLoggedIn.service";
import { SipService } from "./services/sip.service";
import { sharedService } from "./services/shared.service";
import { OverlayContainer } from "@angular/cdk/overlay";
import { httpService } from "./services/http.service";
import { cacheService } from "./services/cache.service";
import { TranslateService } from "@ngx-translate/core";
import { crmEventsService } from './services/crmEvents.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, AfterViewInit{
  title = "unified-agent-gadget";
  @HostBinding("class") className = "";
  themeChange;
  timer;
  @ViewChild('mainArea',  { static: false })
  mainArea: ElementRef;

  currentRoute: string;
  isMobile = false;

  constructor(
    private overlay: OverlayContainer,
    public _cacheService: cacheService,
    public _finesseService: finesseService,
    private _router: Router,
    private _httpService: httpService,
    private _isLoggedInservice: isLoggedInService,
    private _sipService: SipService,
    private _sharedService: sharedService,
    private _translateService: TranslateService,
    private ref: ChangeDetectorRef,
    private _crmEventsService: crmEventsService
  ) {}
  isdarkMode = false;

  ngOnInit() {
    this.ref.detectChanges();
    if (this.mainArea.nativeElement.offsetWidth < 768) {
      this.isMobile = true;
      console.log('this.mainArea.nativeElement.offsetWidth ', this.mainArea.nativeElement.offsetWidth);

      this.checkCompactView(this.isMobile);
    } else {
      this.checkCompactView(false);

    }


    // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    //   this.isMobile = true;
    // }

    this._translateService.setDefaultLang("en");
    this._router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentRoute = event.url;
      }
    });
    this._httpService.getConversationSettings().subscribe(
      (data) => {
        this._sharedService.setConversationSettings(data[0]);
      },
      (err) => {
        console.error("unable to get conversation setting", err);
      }
    );
    let customerSchema: any;
    let channelTypes: any;
    try {
      customerSchema = JSON.parse(localStorage.getItem("customerSchema"));
      channelTypes = JSON.parse(localStorage.getItem("channelTypes"));
    } catch (e) {}
    if (customerSchema) {
      this._sharedService.schema = customerSchema;
    }
    if (channelTypes) {
      this._sharedService.channelTypeList = channelTypes;
    }
  }
  checkCompactView(e) {
    this._sharedService.isCompactView = e;
  }
  ngAfterViewInit() {
    // this.ref.detectChanges();
    // var width = this.mainArea.nativeElement.offsetWidth;
    // var height = this.mainArea.nativeElement.offsetHeight;
    //
    // if(this.mainArea.nativeElement.offsetWidth < 768){
    //   this.isMobile = true;
    //   console.log('this.mainArea.nativeElement.offsetWidth ', this.mainArea.nativeElement.offsetWidth );
    // }
    //
    // console.log('Width:' + width);
    // console.log('Height: ' + height);
  }

  updateTheme(theme: string) {
    try {
      this._httpService.updateAgentSettings({ theme: theme }, this._cacheService.agent.id).subscribe((e) => {});
    } catch (err) {
      console.error(`error updating theme`, err);
    }
  }

  switchTheme(e) {
    this.themeChange = e.isdarkMode;
    const darkClassName = "darkMode";
    this.className = this.themeChange ? darkClassName : "";
    if (this.themeChange === true) {
      if (!e.onlySwitch) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.updateTheme("dark");
        }, 5000);
      }
      this.overlay.getContainerElement().classList.add(darkClassName);
    } else {
      if (!e.onlySwitch) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.updateTheme("light");
        }, 5000);
      }
      this.overlay.getContainerElement().classList.remove(darkClassName);
    }
  }
  switchLanguage(e) {
    this._translateService.use(e.language);
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
