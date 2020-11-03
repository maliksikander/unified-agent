import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDrawerToggleResult, MatSidenav} from '@angular/material';
import {FocusOrigin} from '@angular/cdk/a11y';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {
  @ViewChild('sidenav',  {static: true}) sidenav: MatSidenav;

  conversations = [
    {title: 'farhan'},
    {title: 'raza'}
  ];


  constructor() { }

  ngOnInit() {
  }
  close() {
    // this.reason = reason;
    this.sidenav.close();
  }

}
