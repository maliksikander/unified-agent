import { Component, OnInit, Inject, Input } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { socketService } from "src/app/services/socket.service";
import { Output, EventEmitter } from "@angular/core";
import { TopicParticipant } from "../../models/User/Interfaces";

@Component({
  selector: "app-chat-notifications",
  templateUrl: "./chat-notifications.component.html",
  styleUrls: ["./chat-notifications.component.scss"]
})
export class ChatNotificationsComponent implements OnInit {
  @Input() data: any;
  customerName: string = null;
  channel: string;
  identified: boolean = false;
  channelImageSrc: string;
  @Output() closeRequestHeaderEvent = new EventEmitter<boolean>();

  constructor(private _socketService: socketService, private _cacheService: cacheService) {}

  ngOnInit() {
    console.log("this is data ", this.data);
    if (!this.data.channelSession.linkedCustomer.isAnonymous) {
      this.customerName = this.data.channelSession.linkedCustomer.associatedCustomer.firstName;
      this.identified = true;
    }
    this.channel = this.data.channelSession.channel.channelConnector.channelType.typeName;
    this.channelImageSrc = "assets/images/" + this.channel.toLowerCase() + ".svg";
  }

  getTopicSubscription() {
    this._socketService.emit("topicSubscription", {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, this.data.topicId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      topicId: this.data.topicId
    });
    this.closeRequestHeaderEvent.emit(this.data.topicId);
  }
}
