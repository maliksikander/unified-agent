import { Component, OnInit, SimpleChanges } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { crmEventsService } from "src/app/services/crmEvents.service";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";

@Component({
  selector: "app-chats",
  templateUrl: "./chats.component.html",
  styleUrls: ["./chats.component.scss"]
})
export class ChatsComponent implements OnInit {
  // conversations = [];
  barExpand = false;
    // labels :Array<any>=[];
    
  constructor(private _httpService: httpService, private _crmEventsService: crmEventsService,public _socketService: socketService, public _sharedService: sharedService) {}
  previousTabIndex;
  currentTabIndex : number = 0;
  
  ngOnInit() {
    console.log("[",this.previousTabIndex,"]","prevtConversation",this._socketService.conversations[this.previousTabIndex]);
   
    // this.loadLabels()
    //console.log("[",this.index,"]","prevtConversation",this._socketService.conversations[this.index]);
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes.changeDetecter){
  //     console.log("[",this.index,"]","prevtConversation",this._socketService.conversations[this.index]); 
  //   }
  // }
  // loadLabels() {
  //   this._httpService.getLabels().subscribe((e) => {
  //     this.labels = e;
  //   });
  // }
 
  tabChanged(event: MatTabChangeEvent) {
    this.previousTabIndex = this.currentTabIndex;
    let index = event.index;
   // console.log("[",this.index,"]","prevtConversation",this._socketService.conversations[this.index]);
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
    console.log("chatSwitchIndex",this.currentTabIndex)
    
    console.log("[",this.previousTabIndex,"]","prevtConversation",this._socketService.conversations[this.previousTabIndex]);
    
    console.log("chatConversationS",this._socketService.conversations)
    const selectedConversation = this._socketService.conversations[this.currentTabIndex];

    console.log("[",this.currentTabIndex,"]","currentConversation",this._socketService.conversations[this.currentTabIndex]);
    console.log("===>",event.index)
    this._crmEventsService.chatSwitching(this._socketService.conversations[this.currentTabIndex],this._socketService.conversations[this.previousTabIndex])
    //if(){}
  }
}
