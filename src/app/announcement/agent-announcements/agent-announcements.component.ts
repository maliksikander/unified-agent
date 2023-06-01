import { Component, OnInit } from "@angular/core";
import { cacheService } from "../../services/cache.service";
import { httpService } from "../../services/http.service";
import { announcementService } from "src/app/services/announcement.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-agent-announcements",
  templateUrl: "./agent-announcements.component.html",
  styleUrls: ["./agent-announcements.component.scss"]
})
export class AgentAnnouncementsComponent implements OnInit {
  agentsId={};
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
     private _announcementService : announcementService,
     private _sharedService: sharedService,
     ) {}

  ngOnInit() {

    // this._httpService.getAnnouncements().subscribe((data) => {
    //   console.log("data", data)
    //   this.announcements = data;
    //   this.sortList();
    
    // });

     this.agentsId=this._cacheService.agent.id;

     console.log("this._cacheService.agent",this.agentsId);
     console.log("USER_TEAM",this._cacheService.agent);
     

  }
  onUnreadClick(announcement,announcementId) {
    console.log("USER_TEAM",this._cacheService.agent);
    console.log("this._cacheService.agent",this.agentsId ,"iDDDD",announcementId);
   // announcement.isRead = true;
    //announcement.announcementText="hellllllo";
    if(!announcement.seenBy.includes(this.agentsId))
    {
    let obj={
      "userId":this.agentsId
    }
    this._httpService.AnnouncementSeenByUser(announcementId,obj).subscribe({
      next: (val: any) => {
        announcement.seenBy=val.result.seenBy;
        this._announcementService.countUnreadAnnouncement();
        console.log("read successfully",announcement);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  }
    
  sortList() {
    this.announcements.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
  }
}
