import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-agent-announcements",
  templateUrl: "./agent-announcements.component.html",
  styleUrls: ["./agent-announcements.component.scss"]
})
export class AgentAnnouncementsComponent implements OnInit {
  announcements = [
    {
      message:
        "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
      startTime: "January 16, 2020 - 09:35AM"
    },
    {
      message:
        "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week. The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week. ",
      startTime: "January 16, 2020 - 09:35AM"
    },
    {
      message:
        "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
      startTime: "January 16, 2020 - 09:35AM"
    },
    {
      message:
        "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
      startTime: "January 16, 2020 - 09:35AM"
    },
    {
      message:
        "The office will remain closed on public holiday on December 25th, 2019. Teams with working shift will get a day off in the coming week.",
      startTime: "January 16, 2020 - 09:35AM"
    }
  ];

  constructor() {}

  ngOnInit() {}
  onUnreadClick(announcement) {
    announcement.isRead = true;
  }
}
