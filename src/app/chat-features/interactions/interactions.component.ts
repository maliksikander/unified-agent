import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { MatDialog, MatDialogRef } from "@angular/material";
import { CimEvent } from "../../models/Event/cimEvent";
import { v4 as uuidv4 } from "uuid";
import { NgScrollbar } from "ngx-scrollbar";
import { snackbarService } from "src/app/services/snackbar.service";
import { FilePreviewComponent } from "src/app/file-preview/file-preview.component";
import { appConfigService } from "src/app/services/appConfig.service";
import { httpService } from "src/app/services/http.service";
import { finesseService } from "src/app/services/finesse.service";
import { ConfirmationDialogComponent } from "src/app/new-components/confirmation-dialog/confirmation-dialog.component";
import { WrapUpFormComponent } from "../wrap-up-form/wrap-up-form.component";
import { stringLength } from "@firebase/util";

declare var EmojiPicker: any;

@Component({
  selector: "app-interactions",
  templateUrl: "./interactions.component.html",
  styleUrls: ["./interactions.component.scss"]
})
export class InteractionsComponent implements OnInit {
  @Input() conversation: any;
  @Input() customerBar: any;
  @Input() currentTabIndex: any;
  @Input() changeDetecter: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  @Output() updatedlabels = new EventEmitter<boolean>();
  @ViewChild("replyInput", { static: true }) elementView: ElementRef;
  @ViewChild(NgScrollbar, { static: true }) scrollbarRef: NgScrollbar;
  @ViewChild("media", { static: false }) media: ElementRef;
  @ViewChild("mainScreen", { static: false }) elementViewSuggestions: ElementRef;

  dispayVideoPIP = true;
  scrollSubscriber;
  labels: Array<any> = [];
  quotedMessage: any;
  replyToMessageId: any;
  viewFullCommentAction: boolean = false;
  fullPostView: boolean = false;

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
  viewHeight = "138px";
  noMoreConversation = false;
  pastCimEventsOffsetLimit: number = 0;
  loadingPastActivity: boolean = false;
  ciscoDialogId;
  activeChat = false;
  activeChannelSessionList: Array<any>;
  fbPostId: string = null;
  fbCommentId: string = null;
  conversationSettings: any;
  constructor(
    private _sharedService: sharedService,
    public _cacheService: cacheService,
    public _socketService: socketService,
    private dialog: MatDialog,
    private _snackbarService: snackbarService,
    public _appConfigService: appConfigService,
    private _httpService: httpService,
    private _finesseService: finesseService
  ) {}
  ngOnInit() {
    //  console.log("i am called hello")
    if (navigator.userAgent.indexOf("Firefox") != -1) {
      this.dispayVideoPIP = false;
    }
    this.convers = this.conversation.messages;
    // setTimeout(() => {
    //   new EmojiPicker();
    // }, 500);
    this._finesseService._ciscoDialogID.subscribe((res) => {
      this.ciscoDialogId = res;
    });
    this.conversationSettings = this._sharedService.conversationSettings;
    this.loadLabels();
  }
  loadLabels() {
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e;
    });
  }
  emoji() {}

  onSend(text) {
    text = text.trim();

    this.constructAndSendCimEvent("plain", "", "", "", text);
  }

  fbCommentAction(message, action) {
    if (action == "like" && message["isLiked"]) {
    } else if (this._socketService.isSocketConnected) {
      let fbCommentId = message.header.providerMessageId;

      if (fbCommentId && message.body.postId) {
        let fbChannelSession = this.getFaceBookChannelSession();

        if (fbChannelSession) {
          let originalFbChannelSession = JSON.parse(JSON.stringify(fbChannelSession));
          delete originalFbChannelSession["isChecked"];
          delete originalFbChannelSession["isDisabled"];

          this.constructAndSendFbAction(fbCommentId, message.body.postId, originalFbChannelSession, message.id, action);
        } else {
          this._snackbarService.open("Requested session not available at the momnet", "succ");
        }
      } else {
        this._snackbarService.open("unable to process the request", "err");
      }
    } else {
      this._snackbarService.open("unable to connect with server", "err");
    }
  }

  constructAndSendFbAction(commentId, postId, fbChannelSession, replyToMessageId, action) {
    let message = this.getCimMessage();

    let obj = fbChannelSession.channelData.additionalAttributes.find((attr) => {
      return attr.key.toLowerCase() == "comment_id";
    });

    obj["value"] = commentId;
    message.body.postId = postId;
    message.body.type = "COMMENT";
    message.header.channelSession = fbChannelSession;
    message.header.channelData = fbChannelSession.channelData;
    message.header.replyToMessageId = replyToMessageId;
    if (action == "like" || action == "delete" || action == "hide") {
      message.body.itemType = action.toUpperCase();
      this.emitFBActionEvent(message);
    }

    // do whatever you want here for these three actions and remove their implementation from the 'constructAndSendCimEvent' function also
  }

  replyToFbComment(message) {
    this.fbPostId = message.body.postId;
    this.replyToMessageId = message.id;

    message.header.channelData.additionalAttributes.forEach((attr) => {
      if (attr.key == "comment_id") {
        this.fbCommentId = attr.value;
      }
    });

    if (this.fbPostId && this.fbCommentId) {
      let fbChannelSession = this.getFaceBookChannelSession();

      if (fbChannelSession) {
        this.conversation.activeChannelSessions.forEach((channelSession) => {
          channelSession.isChecked = false;
        });

        fbChannelSession.isChecked = true;

        this.conversation.activeChannelSessions = this.conversation.activeChannelSessions.concat([]);

        this.openQuotedReplyArea(message);
      } else {
        this._snackbarService.open("Requested session not available at the moment", "succ");
      }
    } else {
      this._snackbarService.open("unable to process the request", "err");
    }
  }

  openDialog(templateRef, e): void {
    this.popTitle = e;

    this.dialog.open(templateRef, {
      panelClass: "wrap-dialog"
    });
  }
  openQuotedReplyArea(e) {
    this.quotedMessage = e;
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

      setTimeout(() => {
        this.viewHeight = this.elementViewSuggestions.nativeElement.offsetHeight + 138 + "px";
        this.downTheScrollAfterMilliSecs(0, "smooth");
        // this.viewHeight = this.mainHeight + 180 + 'px';
        // this.scrollToBottom();
      }, 100);

      this.cannedTabOpen = true;
    } else {
      this.cannedTabOpen = false;
      this.quickReplies = true;
      this.viewHeight = "138px";
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
  eventFromChildForUpdatedLabel(data) {
    this.labels = data;
  }
  // topicUnsub() {
  //   console.log("going to unsub from topic " + this.conversation.conversationId);

  //   if (this.conversation.state === "ACTIVE") {
  //     // if the topic state is 'ACTIVE' then agent needs to request the agent manager for unsubscribe
  //     this._socketService.emit("topicUnsubscription", {
  //       conversationId: this.conversation.conversationId,
  //       agentId: this._cacheService.agent.id
  //     });
  //   } else if (this.conversation.state === "CLOSED") {
  //     // if the topic state is 'CLOSED' it means agent is already unsubscribed by the agent manager
  //     // now it only needs to clear the conversation from conversations array
  //     this._socketService.removeConversation(this.conversation.conversationId);
  //   }
  // }

  onLeaveClick() {
    if (this._socketService.isVoiceChannelSessionExists(this.conversation.activeChannelSessions)) {
      this.closeConversationConfirmation();
    } else {
      this._socketService.topicUnsub(this.conversation);
    }
  }

  closeConversationConfirmation() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "Close Conversation", message: `Call in progress,Are you sure you want to close this conversation?` }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "confirm") {
        this._finesseService.isLeaveButtonClicked = true;
        this.endCallOnFinesse();
        this._finesseService.emitEndChannelSessionEvent();
        this._socketService.topicUnsub(this.conversation);
      }
    });
  }

  endCallOnFinesse() {
    let data = {
      action: "releaseCall",
      parameter: {
        dialogId: this._socketService.ciscoDialogId ? this._socketService.ciscoDialogId : this.conversation.ciscoDialogId
      }
    };
    this._finesseService.endCallOnFinesse(data);
  }

  downTheScrollAfterMilliSecs(milliseconds, behavior) {
    setTimeout(() => {
      try {
        document.getElementById("chat-area-end").scrollIntoView({ behavior: behavior, block: "nearest" });
      } catch (err) {}
    }, milliseconds);
  }

  upTheScrollAfterMilliSecs(milliseconds, behavior) {
    setTimeout(() => {
      try {
        document.getElementById("chat-area-start").scrollIntoView({ behavior: behavior, block: "nearest" });
      } catch (err) {}
    }, milliseconds);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("changes", changes);
    if (changes.changeDetecter && changes.changeDetecter.currentValue && this.conversation.index == this._sharedService.matCurrentTabIndex) {
      if (
        changes.changeDetecter.currentValue.header.sender.type.toLowerCase() == "agent" &&
        changes.changeDetecter.currentValue.header.sender.participant.keycloakUser.id == this._cacheService.agent.id
      ) {
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
    // console.log("before",this.conversation.activeChannelSessions)
    //     this.activeChannelSessionList = this.conversation.activeChannelSessions;
    //     this.activeChannelSessionList.forEach((item, index, array) => {
    //      if (index === array.length - 1 && item.channel.channelType.name != "VOICE" && item.channel.channelType.name != "facebook") {
    //         item.isChecked = true;
    //       }
    //       else if (array.length >1 && index === array.length - 1 && (item.channel.channelType.name == "VOICE" || item.channel.channelType.name == "facebook"))
    //         {
    //           item.isChecked = false;
    //         this.activeChannelSessionList[array.length - 2].isChecked = true;
    //       } else {
    //         item.isChecked = false;
    //       }
    //       console.log("after",this.conversation.activeChannelSessions)
    // });

    this._finesseService.currentConversation.next(this.conversation);
  }

  ngOnDestroy() {
    this.scrollSubscriber.unsubscribe();
  }

  adjustHeightOnComposerResize() {
    if (this.currentScrollPosition > 95) {
      this.downTheScrollAfterMilliSecs(30, "smooth");
    }
  }

  videoPIP(id) {
    try {
      const video: any = document.getElementById(id);
      video.requestPictureInPicture().then((pictureInPictureWindow) => {
        pictureInPictureWindow.addEventListener("resize", () => false);
      });
    } catch (err) {
      this._snackbarService.open("PIP not supported in this browser", "succ");
      console.error(err);
    }
  }

  fullLocation(lat, lng) {
    const locationUrl = `http://maps.google.com/maps?q=${lat}, ${lng}`;
    window.open(locationUrl, "_blank");
  }

  filePreviewOpener(url, fileName, type) {
    url = this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream" + new URL(url).search;

    const dialogRef = this.dialog.open(FilePreviewComponent, {
      maxHeight: "100vh",
      maxWidth: "100%",
      height: "auto",
      width: "auto",
      data: { fileName: fileName, url: url, type: type }
    });
    dialogRef.afterClosed().subscribe((result: any) => {});
  }

  uploadFile(files) {
    let availableExtentions: any = ["txt", "png", "jpg", "jpeg", "pdf", "ppt", "xlsx", "xls", "doc", "docx", "rtf"];
    let ln = files.length;
    if (ln > 0) {
      for (var i = 0; i < ln; i++) {
        const fileSize = files[i].size;
        const fileMimeType = files[i].name.split(".").pop();

        if (fileSize <= 5000000) {
          if (availableExtentions.includes(fileMimeType.toLowerCase())) {
            let fd = new FormData();
            fd.append("file", files[i]);
            fd.append("conversationId", `${Math.floor(Math.random() * 90000) + 10000}`);
            this._httpService.uploadToFileEngine(fd).subscribe(
              (e) => {
                this.constructAndSendCimEvent(e.type.split("/")[0], e.type, e.name, e.size);
              },
              (error) => {
                this._snackbarService.open(error, "err");
              }
            );
          } else {
            this._snackbarService.open(files[i].name + " unsupported type", "err");
          }
        } else {
          this._snackbarService.open(files[i].name + " File size should be less than 5MB", "err");
        }
      }
    }
  }

  constructAndSendCimEvent(msgType, fileMimeType?, fileName?, fileSize?, text?, wrapups?, note?) {
    if (this._socketService.isSocketConnected) {
      let message = this.getCimMessage();

      if (msgType.toLowerCase() == "wrapup") {
        message = this.constructWrapUpEvent(message, wrapups, note, this.conversation.firstChannelSession);

        this.emitCimEvent(message);
      } else {
        let selectedChannelSession = this.conversation.activeChannelSessions.find((item) => item.isChecked == true);

        if (selectedChannelSession) {
          if (selectedChannelSession.channel.channelType.name.toLowerCase() == "facebook") {
            // channel session is facebook

            message = this.constructFbCommentEvent(message, text, selectedChannelSession);

            this.emitCimEvent(message);
          } else {
            // channel is web or whatsApp

            let sendingActiveChannelSession = JSON.parse(JSON.stringify(selectedChannelSession));

            delete sendingActiveChannelSession["webChannelData"];
            delete sendingActiveChannelSession["isChecked"];
            delete sendingActiveChannelSession["isDisabled"];

            message.header.sender = this.conversation.topicParticipant;
            message.header.channelSession = sendingActiveChannelSession;
            message.header.channelData = sendingActiveChannelSession.channelData;

            if (msgType.toLowerCase() == "plain") {
              message.body.type = "PLAIN";
              message.body.markdownText = text.trim();
            } else if (msgType.toLowerCase() == "application" || msgType.toLowerCase() == "text") {
              message.body.type = "FILE";
              message.body["caption"] = "";
              message.body["additionalDetails"] = { fileName: fileName };
              message.body["attachment"] = {
                mediaUrl: this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream?filename=" + fileName,
                mimeType: fileMimeType,
                size: fileSize
              };
            } else if (msgType.toLowerCase() == "image") {
              message.body.type = "IMAGE";
              message.body["caption"] = fileName;
              message.body["additionalDetails"] = {};
              message.body["attachment"] = {
                mediaUrl: this._appConfigService.config.FILE_SERVER_URL + "/api/downloadFileStream?filename=" + fileName,
                mimeType: fileMimeType,
                size: fileSize,
                thumbnail: ""
              };
            }

            this.emitCimEvent(message);
          }
        } else {
          this._snackbarService.open("No channel session selected at the moment ", "err");
        }
      }
    } else {
      this._snackbarService.open("Unable to send the message at the moment ", "err");
    }
  }

  // to get past acitivities
  loadPastActivities(conversation) {
    try {
      this.loadingPastActivity = true;

      let limit = 25;

      this._httpService.getPastActivities(this.conversation.customer._id, limit, this.pastCimEventsOffsetLimit).subscribe(
        (res: any) => {
          ++this.pastCimEventsOffsetLimit;
          let docsLength: number = res ? res.docs.length : 0;
          let docs = res.docs;
          if (docsLength > 0) {
            this.filterAndMergePastActivities(docs);
          } else {
            if (conversation == "FAKE_CONVERSATION") this._snackbarService.open("No Conversation Found", "succ");
            this.noMoreConversation = true;
          }
        },
        (error) => {
          this.loadingPastActivity = false;
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Load Past Activity] Error :", e);
    }
  }

  // to filter out activities and add in the conversation object, it expects a list
  filterAndMergePastActivities(cimEvents: Array<any>) {
    try {
      let msgs = [];
      cimEvents.forEach((event) => {
        if (
          event.name.toLowerCase() == "agent_message" ||
          event.name.toLowerCase() == "bot_message" ||
          event.name.toLowerCase() == "customer_message"
        ) {
          event.data.header["status"] = "sent";
          msgs.push(event.data);
        } else if (
          ["channel_session_started", "channel_session_ended", "agent_subscribed", "agent_unsubscribed"].includes(event.name.toLowerCase())
        ) {
          let message = this._socketService.createSystemNotificationMessage(event);
          msgs.push(message);
        } else if (event.name.toLowerCase() == "conversation_data_changed") {
          let message = this._socketService.createConversationDataMessage(event);
          msgs.push(message);
        }
      });

      // msgs.reverse();
      msgs.forEach((msg) => {
        if (
          msg.header.sender.type.toLowerCase() == "agent" &&
          msg.body.type.toLowerCase() == "comment" &&
          msg.body.itemType.toLowerCase() != "text"
        ) {
          this._socketService.processFaceBookCommentActions(msgs, msg);
        } else {
          this.conversation.messages.unshift(msg);
        }
      });

      this.noMoreConversation = false;
      this.loadingPastActivity = false;
      this.upTheScrollAfterMilliSecs(0, "smooth");
    } catch (e) {
      console.error("[Load Past Activity] Filter Error :", e);
    }
  }

  onKeydown(event) {
    event.preventDefault();
  }

  // to open dialog form
  openWrapUpDialog(e): void {
    const dialogRef = this.dialog.open(WrapUpFormComponent, {
      panelClass: "wrap-dialog",
      data: { header: e, conversation: this.conversation }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.event == "apply") {
        this.constructAndSendCimEvent("wrapup", "", "", "", "", res.data.wrapups, res.data.note);
      }
    });
  }

  switchChannelSession(channelSession, channelIndex) {
    try {
      if (!channelSession.isDisabled) {
        if (!channelSession.isChecked) {
          this.conversation.activeChannelSessions.forEach((channelSession) => {
            channelSession.isChecked = false;
          });

          channelSession["isChecked"] = true;

          this.conversation.activeChannelSessions = this.conversation.activeChannelSessions.concat([]);
        }
      }
    } catch (e) {
      console.error("[Error in Channel Switching] :", e);
    }
  }

  getFaceBookChannelSession() {
    console.log("kkk", this.conversation.activeChannelSessions);
    let fbChannelSession = this.conversation.activeChannelSessions.find((channelSession) => {
      console.log("kkk", channelSession.channel.channelType.name);

      return channelSession.channel.channelType.name.toLowerCase() == "facebook";
    });

    return fbChannelSession;
  }

  getCimMessage() {
    let message: any = {
      id: "",
      header: { timestamp: "", sender: {}, channelSession: {}, channelData: {} },
      body: { markdownText: "", type: "" }
    };

    message.id = uuidv4();
    message.header.timestamp = Date.now();
    message.header.sender = this.conversation.topicParticipant;

    return message;
  }

  constructWrapUpEvent(message, wrapups, note, channelSession) {
    let sendingActiveChannelSession = JSON.parse(JSON.stringify(channelSession));
    delete sendingActiveChannelSession["webChannelData"];
    delete sendingActiveChannelSession["isChecked"];
    delete sendingActiveChannelSession["isDisabled"];

    message.body.type = "WRAPUP";
    message.body.markdownText = "";
    message.body["wrapups"] = wrapups;
    message.body["note"] = note;
    message.header.channelSession = sendingActiveChannelSession;
    message.header.channelData = sendingActiveChannelSession.channelData;

    return message;
  }

  constructFbCommentEvent(message, text, channelSession) {
    let sendingActiveChannelSession = JSON.parse(JSON.stringify(channelSession));
    delete sendingActiveChannelSession["webChannelData"];
    delete sendingActiveChannelSession["isChecked"];
    delete sendingActiveChannelSession["isDisabled"];

    message.header.providerMessageId = this.fbCommentId;

    message.body.type = "COMMENT";
    message.body.postId = this.fbPostId;
    message.body.itemType = "TEXT";
    message.body.markdownText = text.trim();
    message.header.replyToMessageId = this.replyToMessageId;
    message.header.channelSession = sendingActiveChannelSession;
    message.header.channelData = sendingActiveChannelSession.channelData;

    return message;
  }

  emitCimEvent(message) {
    let event: any = new CimEvent("AGENT_MESSAGE", "MESSAGE", this.conversation.conversationId, message);
    this._socketService.emit("publishCimEvent", {
      cimEvent: event,
      agentId: this._cacheService.agent.id,
      conversationId: this.conversation.conversationId
    });

    console.log("event data==>", event.data);
    event.data.header["status"] = "sending";
    this.conversation.messages.push(event.data);

    setTimeout(() => {
      this.message = "";

      this.quotedMessage = null;
    }, 40);
  }

  emitFBActionEvent(message) {
    let event: any = new CimEvent("AGENT_MESSAGE", "MESSAGE", this.conversation.conversationId, message);
    this._socketService.emit("publishCimEvent", {
      cimEvent: event,
      agentId: this._cacheService.agent.id,
      conversationId: this.conversation.conversationId
    });

    // console.log("event data==>", event.data);
    setTimeout(() => {
      this.message = "";

      this.quotedMessage = null;
    }, 40);
  }
}
