import { Component, OnInit } from '@angular/core';
import {CreateCustomerComponent} from '../create-customer/create-customer.component';
import {AnnouncementDialogComponent} from '../supervisor/announcement-dialog/announcement-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {
  FilterSelected = 'all';

  displayAnnouncements  = [
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },
    {
      message: 'Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.',
      created_by: 'Ev Gayforth',
      expiry_time: '12/03/2020 15:25'
    },

  ]
  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }
  onCreateAnnouncement() {
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {


    });
  }

}
