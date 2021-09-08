import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { MatDialog } from "@angular/material";
import { CimEvent } from "../../models/Event/cimEvent";
import { v4 as uuidv4 } from "uuid";
import { NgScrollbar } from "ngx-scrollbar";

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

  ngAfterViewInit() {
    this.scrollbarRef.scrollable.elementScrolled().subscribe((scrolle: any) => {
      let scroller = scrolle.target;
      let height = scroller.clientHeight;
      let scrollHeight = scroller.scrollHeight - height;
      let scrollTop = scroller.scrollTop;
      let percent = Math.floor((scrollTop / scrollHeight) * 100);
      this.currentScrollPosition = percent;
      //   let di : any = document.getElementById('datestamp').getBoundingClientRect();
      //  console.log("bounding "+di.y);
      //  if(di.y < 93){
      //    console.log("need to change class")
      //  }

      if (percent > 80) {
        this.showNewMessageNotif = false;
      }
    });
  }

  showNewMessageNotif: boolean = false;
  currentScrollPosition: number = 100;
  lastMsgFromAgent: boolean = false;

  isBarOPened = false;
  activeSessions = [];

  unidentified = true;
  isConnected = true;
  popTitle = "Notes";
  expanedHeight = 0;

  channelUrl = "assets/images/web.svg";
  options: string[] = [
    "Glenn Helgass",
    " Ev Gayforth",
    "Adam Joe Stanler",
    "Fayina Addinall",
    "Doy Ortelt",
    "Donnie Makiver",
    "Verne West-Frimley",
    " Ev Gayforth",
    "Adam Joe Stanler",
    "Fayina Addinall",
    "Doy Ortelt",
    "Donnie Makiver",
    "Verne West-Frimley",
    "Glenn Helgass",
    " Ev Gayforth"
  ];
  categories: string[] = ["Fayina Addinall", "Doy Ortelt", " Ev Gayforth", "Adam Joe Stanler"];

  customer: any = {
    type: "Customer",
    info: {
      channel: "web",
      email: "farhan.maqbool@expertflow.com",
      firstName: "farhan",
      id: "",
      language: "en",
      lastName: "maqbool",
      name: "farhan ",
      phone: "5555",
      refId: "5555",
      url: "http://localhost:4200/"
    }
  };
  message = "";
  convers: any[];
  ringing = false;
  callControls = true;
  cannedMessages = [
    {
      category: "marketing",
      messages: ["Hi, how are you", "How may I help you?"]
    },
    {
      category: "information",
      messages: ["Info message 1", "Info message 2"]
    }
  ];
  actions = [
    {
      name:
        "If a customer submits a support ticket, they deserve 1. confirmation that you received the ticket, and 2. affirmation that you are working on it."
    },
    {
      name:
        "If possible, personalize this response relative to the issue. If a customer filled out a form with drop-down category, this is easy. Additionally, you can train your reps to know which response to use."
    },
    {
      name:
        "To help ameliorate this tendency, make sure you proactively follow-up with them letting them know you're still working hard to reach a resolution, and that you will let them know when there are updates. This shows you care."
    }
  ];
  isSuggestion = false;
  displaySuggestionsArea = false;
  cannedTabOpen = false;
  quickReplies = true;
  viewHeight = "162px";

  constructor(
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _socketService: socketService,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
    //  console.log("i am called hello")
    this.convers = this.conversation.messages;
    setTimeout(() => {
      new EmojiPicker();
    }, 500);
  }

  emoji() { }

  onSend(text) {
    let message = JSON.parse(JSON.stringify(this.conversation.messages[this.conversation.messages.length - 1]));
    message.id = uuidv4();
    message.header.timestamp = Date.now();
    message.header.sender = {};

    message.header.sender = this.conversation.topicParticipant;
    message.header.channelSession = this.conversation.activeChannelSessions[this.conversation.activeChannelSessions.length - 1];

    message.body.markdownText = text;
    delete message["botSuggestions"];
    delete message["showBotSuggestions"];

    this._socketService.emit("publishCimEvent", {
      cimEvent: new CimEvent("AGENT_MESSAGE", "MESSAGE", message),
      agentId: this._cacheService.agent.id,
      topicId: this.conversation.topicId
    });
    this.lastMsgFromAgent = true;
    setTimeout(() => {
      this.message = "";
    }, 40);
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
  textChanged(event) {
    const el: any = document.getElementById("messageTextarea");
    this.message = el.value;
  }

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
      if (this.lastMsgFromAgent) {
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
    this.lastMsgFromAgent = false;
  }
}
