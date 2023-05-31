import { Component, OnInit } from "@angular/core";
import { cacheService } from "../../services/cache.service";
import { httpService } from "../../services/http.service";
import { announcementService } from "src/app/services/announcement.service";

@Component({
  selector: "app-agent-announcements",
  templateUrl: "./agent-announcements.component.html",
  styleUrls: ["./agent-announcements.component.scss"]
})
export class AgentAnnouncementsComponent implements OnInit {
  agentsData:any ;
  announcements =[];
  // announcements = [
  //   {
  //     message:
  //       "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
  //     startTime: "January 16, 2020 - 09:35AM"
  //   },
  //   {
  //     message:
  //       "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week. The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week. ",
  //     startTime: "January 16, 2020 - 09:35AM"
  //   },
  //   {
  //     message:
  //       "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
  //     startTime: "January 16, 2020 - 09:35AM"
  //   },
  //   {
  //     message:
  //       "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
  //     startTime: "January 16, 2020 - 09:35AM"
  //   },
  //   {
  //     message:
  //       "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
  //     startTime: "January 16, 2020 - 09:35AM"
  //   }
  // ];
 

  constructor(
     private _cacheService: cacheService,
     private _httpService: httpService,
     private _announcementService : announcementService
     ) {}

  ngOnInit() {

    // this._httpService.getAnnouncements().subscribe((data) => {
    //   console.log("data", data)
    //   this.announcements = data;
    //   this.sortList();
      
    // });

    // this.agentsData=this._cacheService.agent.userTeam;
    // //let teamData=;
    // console.log("this._cacheService.agent",this.agentsData);

  }
  onUnreadClick(announcement) {
    console.log("this._cacheService.agent",this.agentsData);
    announcement.isRead = true;

  }
    
  sortList() {
    this.announcements.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
  }
}
