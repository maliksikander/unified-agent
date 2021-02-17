import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

}
