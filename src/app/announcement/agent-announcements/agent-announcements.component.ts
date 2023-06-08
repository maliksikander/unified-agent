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
  agentsId = {};
  announcements = [];

  constructor(
    private _cacheService: cacheService,
    private _httpService: httpService,
    private _announcementService: announcementService,
    private _sharedService: sharedService,
  ) { }

  ngOnInit() {
    this.agentsId = this._cacheService.agent.id; 
    this.sortList();
  }
  
  onUnreadClick(announcement, announcementId) {
   
    if (!announcement.seenBy.includes(this.agentsId)) {
      let obj = {
        "userId": this.agentsId
      }
      this._httpService.AnnouncementSeenByUser(announcementId, obj).subscribe({
        next: (val: any) => {
          announcement.seenBy = val.result.seenBy;
          this._announcementService.countUnreadAnnouncement();
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
