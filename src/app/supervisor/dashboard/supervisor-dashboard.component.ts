import { Component, OnInit, ViewChild } from "@angular/core";
import { MatAccordion, MatTableDataSource } from "@angular/material";

export interface PeriodicElement {
  title: string;
  agent: string;
  team: string;
  time: string;
  channel: string;
  handRaise: boolean;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { title: "Glenn Helgass", agent: "Sandie Friedank", team: "Default", time: "06/02/2021 06:22PM", channel: "web", handRaise: true },
  { title: "Ev Gayforth", agent: "Victoria Romero", team: "Default", time: "06/02/2021 06:22PM", channel: "FB", handRaise: false },
  { title: "Adam Stanler", agent: "Adam Miller", team: "Default", time: "06/02/2021 06:22PM", channel: "Whatsapp", handRaise: false },
  { title: "Fayina Addinall", agent: "Tootsie Showler", team: "Default", time: "06/02/2021 06:22PM", channel: "viber", handRaise: true },
  { title: "Addinall Helgass", agent: "Olenka Grunnill", team: "Default", time: "06/02/2021 06:22PM", channel: "sms", handRaise: false }
];

@Component({
  selector: "app-supervisor-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  agentChatInfo = false;
  queueStatsInfo = false;
  displayedColumns: string[] = ["handRaise", "title", "agent", "team", "time", "channel"];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  queueStatsData = [
    {
      sr: 1,
      queue: "Marketing",
      count: "6",
      maxTime: "01:06:22",
      active: "web",
      busy: "8",
      ready: "7",
      not_ready: "13",
      labels: [
        { name: "label 1", count: 6, maxTime: "01:06:22" },
        { name: "label 2", count: 5, maxTime: "01:06:22" }
      ]
    },
    {
      sr: 2,
      queue: "Inbound",
      count: "16",
      maxTime: "01:22:22",
      active: "web",
      busy: "4",
      ready: "6",
      not_ready: "2",
      labels: [
        { name: "label 1", count: 6, maxTime: "01:06:22" },
        { name: "label 2", count: 5, maxTime: "01:06:22" }
      ]
    },
    {
      sr: 3,
      queue: "OutBoaund",
      count: "8",
      maxTime: "00:35:42",
      active: "web",
      busy: "5",
      ready: "4",
      not_ready: "8",
      labels: [
        { name: "label 1", count: 6, maxTime: "01:06:22" },
        { name: "label 2", count: 5, maxTime: "01:06:22" },
        { name: "label 3", count: 8, maxTime: "01:06:22" }
      ]
    },
    {
      sr: 4,
      queue: "Product Support",
      count: "5",
      maxTime: "01:15:52",
      active: "web",
      busy: "9",
      ready: "8",
      not_ready: "6",
      labels: [
        { name: "test", count: 6, maxTime: "01:06:22" },
        { name: "test", count: 6, maxTime: "01:06:22" }
      ]
    },
    {
      sr: 5,
      queue: "Product Information",
      count: "7",
      maxTime: "01:26:32",
      active: "web",
      busy: "12",
      ready: "5",
      not_ready: "9",
      labels: [
        { name: "test", count: 6, maxTime: "01:06:22" },
        { name: "test", count: 6, maxTime: "01:06:22" }
      ]
    },
    {
      sr: 6,
      queue: "Channel Marketing",
      count: "9",
      maxTime: "01:36:12",
      active: "web",
      busy: "4",
      ready: "3",
      not_ready: "2",
      labels: [
        { name: "test", count: 6, maxTime: "01:06:22" },
        { name: "test", count: 6, maxTime: "01:06:22" }
      ]
    }
  ];
  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;
  isAllExpanded = false;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor() {}

  ngOnInit() {}

  infoBar(e) {
    if (e === "queueStats") {
      this.queueStatsInfo = !this.queueStatsInfo;
    } else if (e === "activeChats") {
      this.agentChatInfo = !this.agentChatInfo;
    }
  }

  toggleExpand() {
    this.isAllExpanded = !this.isAllExpanded;
    if (this.isAllExpanded) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }
}
