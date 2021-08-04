import { Component, OnInit } from '@angular/core';
import {MatCheckboxChange, MatDialog} from '@angular/material';

@Component({
  selector: 'app-subscribed-list',
  templateUrl: './subscribed-list.component.html',
  styleUrls: ['./subscribed-list.component.scss']
})
export class SubscribedListComponent implements OnInit {

  subscribedList  = ['Customer Chat', 'Software Queries', 'Customer Queries', 'General Information', 'Helpline'];
  listSelection = [
    {id: 1, listName: 'Customer Chat'},
    {id: 2, listName: 'Software Queries'},
    {id: 3, listName: 'Customer Queries'},
    {id: 4, listName: 'General Information'},
    {id: 5, listName: 'Helpline'},
    {id: 6, listName: 'Hardware Queries'},
    {id: 7, listName: 'Queries List'},
    {id: 8, listName: 'Software Queries'},
    {id: 9, listName: 'General Information'},
    {id: 10, listName: 'Customer General Help'},
  ];
  updateListData = [];
  listPreview = false;
  toggle(item, event: MatCheckboxChange) {
    if (event.checked) {
      this.updateListData.push(item);
    } else {
      const index = this.updateListData.indexOf(item);
      if (index >= 0) {
        this.updateListData.splice(index, 1);
      }
    }
  }

  exists(item) {
    return this.updateListData.indexOf(item) > -1;
  }

  isIndeterminate() {
    return (this.updateListData.length > 0 && !this.isChecked());
  }

  isChecked() {
    return this.updateListData.length === this.listSelection.length;
  }


  toggleAll(event: MatCheckboxChange) {

    if (event.checked) {

      this.listSelection.forEach(row => {
        // console.log('checked row', row);
        this.updateListData.push(row);
      });

      // console.log('checked here');
    } else {
      // console.log('checked false');
      this.updateListData.length = 0;
    }
  }


  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  updateSubscribeList(templateRef): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  eventFromChild(data) {
    this.listPreview = data;
  }
}
