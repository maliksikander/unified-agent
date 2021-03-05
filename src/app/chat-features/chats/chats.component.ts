import { Component, OnInit, ViewChild } from '@angular/core';
import { socketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  conversations=[];

  constructor(public _socketService: socketService) {

  }
  ngOnInit() {
  
  }

}
