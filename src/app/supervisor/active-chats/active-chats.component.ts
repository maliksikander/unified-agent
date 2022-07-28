import { Component, OnInit } from "@angular/core";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material";
import { httpService } from "../../services/http.service";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";
import { sharedService } from "src/app/services/shared.service";
// import { getChannelLogoByName }    from '../../shared/pipes/getChannelLogoByName.pipe'

@Component({
  selector: "app-active-chats",
  templateUrl: "./active-chats.component.html",
  styleUrls: ["./active-chats.component.scss"]
})
export class ActiveChatsComponent implements OnInit {
  FilterSelected = "agents";
  timerSubscription: Subscription;
  filter: string;
  filteredData = [];
  activeChatListWithAgents: [];
  activeChatListWithBots: [];

  constructor(private dialog: MatDialog, private _httpService: httpService, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.filter = this.route.snapshot.queryParamMap.get("filter") ? this.route.snapshot.queryParamMap.get("filter") : "agents";
    if (this.filter == "agents") {
      this.FilterSelected = "agents";
    } else if (this.filter == "bots") {
      this.FilterSelected = "bots";
    }
    this.timerSubscription = timer(0, 10000)
      .pipe(
        map(() => {
          this._httpService.getAllActiveChatsWithAgents().subscribe((e) => {
            this.activeChatListWithAgents = e;
            console.log("Active chats with agents==>",e)
          });
          this._httpService.getAllActiveChatsWithBots().subscribe((e) => {
            this.activeChatListWithBots = e;
          });
        }, retry())
      )
      .subscribe();
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "Close Topic", message: `Are you sure you want to close this topic?` }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }
}
