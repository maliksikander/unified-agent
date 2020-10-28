import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss']
})
export class InteractionsComponent implements OnInit {
  @Input('conversation') conversation: any;
  conversations = [];

  constructor() { }

  ngOnInit() {
  }

}
