import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { MatDialog } from "@angular/material";
import { CimEvent } from "../../models/Event/cimEvent";
import { v4 as uuidv4 } from "uuid";
import { NgScrollbar } from "ngx-scrollbar";
import { snackbarService } from "src/app/services/snackbar.service";
import { FilePreviewComponent } from "src/app/file-preview/file-preview.component";
import { appConfigService } from "src/app/services/appConfig.service";
import { httpService } from "src/app/services/http.service";

declare var EmojiPicker: any;

@Component({
  selector: "app-interactions",
  templateUrl: "./interactions.component.html",
  styleUrls: ["./interactions.component.scss"]
})
export class InteractionsComponent implements OnInit {
  @Input() conversation: any;
  @Input() currentTabIndex: any;
  @Input() changeDetecter: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  @ViewChild("replyInput", { static: true }) elementView: ElementRef;
  @ViewChild(NgScrollbar, { static: true }) scrollbarRef: NgScrollbar;
  @ViewChild('media', { static: false }) media: ElementRef;
  dispayVideoPIP = true;
  scrollSubscriber;

  ngAfterViewInit() {
    this.scrollSubscriber = this.scrollbarRef.scrollable.elementScrolled().subscribe((scrolle: any) => {
      let scroller = scrolle.target;
      let height = scroller.clientHeight;
      let scrollHeight = scroller.scrollHeight - height;
      let scrollTop = scroller.scrollTop;
      let percent = Math.floor((scrollTop / scrollHeight) * 100);
      this.currentScrollPosition = percent;

      if (percent > 80) {
        this.showNewMessageNotif = false;
      }
    });
  }

  categories: string[] = ["Fayina Addinall", "Doy Ortelt", " Ev Gayforth", "Adam Joe Stanler"];

  showNewMessageNotif: boolean = false;
  currentScrollPosition: number = 100;

  isBarOPened = false;
  activeSessions = [];

  unidentified = true;
  isConnected = true;
  popTitle = "Notes";
  expanedHeight = 0;

  message = "";
  convers: any[];
  ringing = false;
  callControls = true;

  isSuggestion = false;
  displaySuggestionsArea = false;
  cannedTabOpen = false;
  quickReplies = true;
  viewHeight = "120px";

  constructor(
    private _sharedService: sharedService,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private dialog: MatDialog,
    private _snackbarService: snackbarService,
    public _appConfigService: appConfigService,
    private _httpService: httpService
  ) { }
  ngOnInit() {
    //  console.log("i am called hello")
    if (navigator.userAgent.indexOf("Firefox") != -1) {
      this.dispayVideoPIP = false;
    }
    this.convers = this.conversation.messages;
    // setTimeout(() => {
    //   new EmojiPicker();
    // }, 500);
  }

  emoji() { }

  onSend(text) {
    this.constructAndSendCimEvent("plain", "", "", "", text);
  }

  openDialog(templateRef, e): void {
    this.popTitle = e;

    this.dialog.open(templateRef, {
      panelClass: "wrap-dialog"
    });
  }

  onTextAreaClick() {
    this.conversation.unReadCount = 0;
  }
  // textChanged(event) {
  //   const el: any = document.getElementById("messageTextarea");
  //   this.message = el.value;
  // }

  onKey(event) {
    this.message = event.target.value;
    this.expanedHeight = this.elementView.nativeElement.offsetHeight;
    // if (this.message === "" && event.keyCode === 40) {
    //   this.isSuggestion = true;
    // } else if (this.message === "" && event.keyCode === 38) {
    //   this.isSuggestion = false;
    // }
    if (this.message[0] === "/" || this.message[0] === " ") {
      this.displaySuggestionsArea = false;
      this.quickReplies = false;

      // setTimeout(() => {
      //   this.mainHeight = this.elementView.nativeElement.offsetHeight;
      //   this.viewHeight = this.mainHeight + 180 + 'px';
      //   this.scrollToBottom();
      // }, 500);

      this.cannedTabOpen = true;
    } else {
      this.cannedTabOpen = false;
      this.quickReplies = true;
      // this.viewHeight = '180px';
    }
    // if (this.message[0] === '.') {
    //     console.log('value is 0')
    //     this.isTemplateOpen = false;
    // }
    if (this.expanedHeight > 50) {
      this.adjustHeightOnComposerResize();
    }

  }
  eventFromChild(data) {
    this.isBarOPened = data;
  }

  topicUnsub() {
    console.log("going to unsub from topic " + this.conversation.topicId);

    if (this.conversation.state === "ACTIVE") {
      // if the topic state is 'ACTIVE' then agent needs to request the agent manager for unsubscribe
      this._socketService.emit("topicUnsubscription", {
        topicId: this.conversation.topicId,
        agentId: this._cacheService.agent.id
      });
    } else if (this.conversation.state === "CLOSED") {
      // if the topic state is 'CLOSED' it means agent is already unsubscribed by the agent manager
      // now it only needs to clear the conversation from conversations array
      this._socketService.removeConversation(this.conversation.topicId);
    }
  }

  downTheScrollAfterMilliSecs(milliseconds, behavior) {
    setTimeout(() => {
      try {
        document.getElementById("chat-area-end").scrollIntoView({ behavior: behavior });
      } catch (err) { }
    }, milliseconds);
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.changeDetecter && changes.changeDetecter.currentValue && this.conversation.index == this._sharedService.matCurrentTabIndex) {
      if (changes.changeDetecter.currentValue.header.sender.type.toLowerCase() == 'agent' &&
        changes.changeDetecter.currentValue.header.sender.participant.keycloakUser.id == this._cacheService.agent.id) {
        this.downTheScrollAfterMilliSecs(50, "smooth");
      } else {
        if (this.currentScrollPosition < 95) {
          this.showNewMessageNotif = true;
        } else {
          this.downTheScrollAfterMilliSecs(50, "smooth");
        }
      }
    }
    if (changes.currentTabIndex) {
      this.downTheScrollAfterMilliSecs(500, "auto");
    }
  }

  ngOnDestroy() {
    this.scrollSubscriber.unsubscribe();
  }

  adjustHeightOnComposerResize() {
    if (this.currentScrollPosition > 95) {
      this.downTheScrollAfterMilliSecs(30, 'smooth');
    }
  }

  videoPIP(id) {

    try {
      const video: any = document.getElementById(id);
      video.requestPictureInPicture()
        .then(pictureInPictureWindow => {
          pictureInPictureWindow.addEventListener("resize", () => false);
        });
    } catch (err) {
      this._snackbarService.open("PIP not supported in this browser", "succ");
      console.error(err);
    }
  }

  fullLocation(lat, lng) {
    const locationUrl = `http://maps.google.com/maps?q=${lat}, ${lng}`;
    window.open(locationUrl, '_blank');
  }

  filePreviewOpener(url, fileName, type) {

    url = this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream" + new URL(url).search;

    const dialogRef = this.dialog.open(FilePreviewComponent, {
      maxHeight: '100vh',
      maxWidth: '100%',
      height: 'auto',
      width: 'auto',
      data: { fileName: fileName, url: url, type: type }
    });
    dialogRef.afterClosed().subscribe((result: any) => {

    });
  }

  uploadFile(files) {
    let availableExtentions: any = ['txt', 'png', 'jpg', 'jpeg', 'pdf', 'ppt', 'xlsx', 'xls', 'doc', 'docx', 'rtf'];
    let ln = files.length;
    if (ln > 0) {
      for (var i = 0; i < ln; i++) {

        const fileSize = files[i].size;
        const fileMimeType = files[i].name.split('.').pop()

        if (fileSize <= 5000000) {
          if (availableExtentions.includes(fileMimeType.toLowerCase())) {

            let fd = new FormData();
            fd.append("file", files[i]);
            fd.append("conversationId", `${Math.floor(Math.random() * 90000) + 10000}`);
            this._httpService.uploadToFileEngine(fd).subscribe((e) => {

              this.constructAndSendCimEvent(e.type.split('/')[0], e.type, e.name, e.size);

            }, (error) => {
              this._snackbarService.open(error, "err");
            });


          } else {
            this._snackbarService.open(files[i].name + " unsupported type", "err");
          }
        } else {
          this._snackbarService.open(files[i].name + " File size should be less than 5MB", "err");
        }

      }
    }
  }


  constructAndSendCimEvent(msgType, fileMimeType?, fileName?, fileSize?, text?) {

    let message: any = {
      id: "",
      header: { timestamp: "", sender: {}, channelSession: {}, channelData: {} },
      body: { markdownText: "", type: "" }
    };
    let lastActiveChannelSession = this.conversation.activeChannelSessions[this.conversation.activeChannelSessions.length - 1];
    if (lastActiveChannelSession) {
      let sendingActiveChannelSession = JSON.parse(JSON.stringify(lastActiveChannelSession));
      delete sendingActiveChannelSession["webChannelData"];

      message.id = uuidv4();
      message.header.timestamp = Date.now();

      message.header.sender = this.conversation.topicParticipant;
      message.header.channelSession = sendingActiveChannelSession;
      message.header.channelData = sendingActiveChannelSession.channelData;


      if (msgType.toLowerCase() == "plain") {

        message.body.type = "PLAIN";
        message.body.markdownText = text.trim();

      } else if (msgType.toLowerCase() == "application" || msgType.toLowerCase() == "text") {

        message.body.type = "FILE";
        message.body['caption'] = "";
        message.body['additionalDetails'] = { 'fileName': fileName };
        message.body['attachment'] = {
          'mediaUrl': this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream?filename=" + fileName,
          'mimeType': fileMimeType,
          'size': fileSize
        }

      } else if (msgType.toLowerCase() == "image") {

        message.body.type = "IMAGE";
        message.body['caption'] = fileName;
        message.body['additionalDetails'] = {};
        message.body['attachment'] = {
          'mediaUrl': this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream?filename=" + fileName,
          'mimeType': fileMimeType,
          'size': fileSize,
          'thumbnail': ""
        }
      } else {
        this._snackbarService.open("unable to process the file", "err");
        return;
      }

      let event: any = new CimEvent("AGENT_MESSAGE", "MESSAGE", message);
      this._socketService.emit("publishCimEvent", {
        cimEvent: new CimEvent("AGENT_MESSAGE", "MESSAGE", message),
        agentId: this._cacheService.agent.id,
        topicId: this.conversation.topicId
      });
      // setTimeout(() => {
      //   this._socketService.onCimEventHandler(event, "12345");

      // }, 5000);

      event.data.header['status'] = 'sending';
      this.conversation.messages.push(event.data);
      // this.downTheScrollAfterMilliSecs(50, "smooth");

      setTimeout(() => {
        this.message = "";
      }, 40);

    } else {
      this._snackbarService.open("No active channel session available", "err");
    }

  }

}
