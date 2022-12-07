import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { httpService } from "../../services/http.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";
import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-queue-chats",
  templateUrl: "./queue-chats.component.html",
  styleUrls: ["./queue-chats.component.scss"]
})
export class QueueChatsComponent implements OnInit {
  queuedChatList = [];
  FilterSelected: any;
  timerSubscription: Subscription;
  queueId: string;
  filteredData = [];

  constructor(
    private dialog: MatDialog,
    private _translateService: TranslateService,
    private _httpService: httpService,
    private route: ActivatedRoute,
    private _snackBarService: snackbarService
  ) {}

  ngOnInit(): void {
    this.queueId = this.route.snapshot.queryParamMap.get("queueId");
    this.timerSubscription = timer(0, 10000)
      .pipe(
        map(() => {
          this._httpService.getAllQueuedChats().subscribe(
            (e) => {
              this.queuedChatList = e;
              if (!(this.FilterSelected + 1)) {
                if (this.queueId) {
                  this.queuedChatList.forEach((item, index) => {
                    if (item.queueId == this.queueId) {
                      this.filteredData = [];
                      this.filteredData.push(item);
                      this.FilterSelected = index;
                    }
                  });
                  if (!(this.FilterSelected + 1)) {
                    this.FilterSelected = "all";
                  }
                } else {
                  this.filteredData = e;
                  this.FilterSelected = "all";
                }
              } else {
                this.filterData();
              }
            },
            (err) => {
              this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Chats-with-Agents"), "err");
            }
          ); // load data contains the http request
        }, retry())
      )
      .subscribe();
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: {
        header: this._translateService.instant("snackbar.Close-Topic"),
        message: this._translateService.instant("snackbar.sure-to-close-this-topic")
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  filterData() {
    // console.log("Filter Selected for Queued Chats", this.FilterSelected);
    if (this.FilterSelected == "all") {
      this.filteredData = this.queuedChatList;
    } else {
      this.filteredData = [];
      this.filteredData.push(this.queuedChatList[this.FilterSelected]);
    }
  }
  reQueue(templateRef): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: "480px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log("The dialog was closed");
    });
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }
}
