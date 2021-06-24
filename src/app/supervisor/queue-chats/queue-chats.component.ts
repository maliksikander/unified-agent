import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {ConfirmationDialogComponent} from '../../new-components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-queue-chats',
  templateUrl: './queue-chats.component.html',
  styleUrls: ['./queue-chats.component.scss']
})
export class QueueChatsComponent implements OnInit {

  activeChatList  = [
    {customerName: 'Glenn Helgass', agent: 'Sandie Friedank', queue: 'marketing', activeTime: '06 min', channel: 'web', flag: 'web.svg'},
    {customerName: 'Ev Gayforth', agent: 'Victoria Romero', queue: 'services', activeTime: '10 min', channel: 'facebook', flag: 'facebook.svg'},
    {customerName: 'Adam Stanler', agent: 'Adam Miller', queue: 'sales', activeTime: '05 min', channel: 'whatsapp', flag: 'whatsapp.svg'},
    {customerName: 'Fayina Addinall', agent: 'Tootsie Showler', queue: 'products', activeTime: '15 min', channel: 'viber', flag: 'viber.svg'},
    {customerName: 'Addinall Helgass', agent: 'Olenka Grunnill', queue: 'services', activeTime: '08 min', channel: 'sms', flag: 'sms.svg'},
    {customerName: 'Ev Gayforth', agent: 'Victoria Romero', queue: 'services', activeTime: '12 min', channel: 'facebook', flag: 'facebook.svg'},
    {customerName: 'Glenn Helgass', agent: 'Sandie Friedank', queue: 'marketing', activeTime: '06 min', channel: 'web', flag: 'web.svg'},
    {customerName: 'Ev Gayforth', agent: 'Victoria Romero', queue: 'services', activeTime: '10 min', channel: 'facebook', flag: 'facebook.svg'},
    {customerName: 'Adam Stanler', agent: 'Adam Miller', queue: 'sales', activeTime: '05 min', channel: 'whatsapp', flag: 'whatsapp.svg'},
    {customerName: 'Fayina Addinall', agent: 'Tootsie Showler', queue: 'products', activeTime: '15 min', channel: 'viber', flag: 'viber.svg'},
    {customerName: 'Addinall Helgass', agent: 'Olenka Grunnill', queue: 'services', activeTime: '08 min', channel: 'sms', flag: 'sms.svg'},
    {customerName: 'Ev Gayforth', agent: 'Victoria Romero', queue: 'services', activeTime: '12 min', channel: 'facebook', flag: 'facebook.svg'},



  ];
  FilterSelected = 'all';

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '490px',
      panelClass: 'confirm-dialog',
      data: { header: 'Close Topic', message: `Are you sure you want to close this topic?` }

    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  reQueue(templateRef): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '480px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
