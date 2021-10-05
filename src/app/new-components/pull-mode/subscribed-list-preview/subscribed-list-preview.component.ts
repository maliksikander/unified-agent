import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-subscribed-list-preview',
  templateUrl: './subscribed-list-preview.component.html',
  styleUrls: ['./subscribed-list-preview.component.scss']
})
export class SubscribedListPreviewComponent implements OnInit {

  @Output() expandCustomerInfo = new EventEmitter<any>();

  activeChatList = [
    {customerName: 'Glenn Helgass', identy: 'Glenn Helgass', queue: 'marketing', activeTime: 6 , channel: 'web', flag: 'web.svg', selfJoined: true, status:  'active', status_color: '#29C671'},
    {customerName: 'Ev Gayforth', identy: 'victoria_romero', queue: 'services', activeTime: 8, channel: 'facebook', flag: 'facebook.svg', status:  'active', status_color: '#29C671'},
    {customerName: 'Adam Stanler', identy: '+0015487412360', queue: 'sales', activeTime: 5 , channel: 'whatsapp', flag: 'whatsapp.svg', status:  'active', status_color: '#29C671'},
    {customerName: 'Fayina Addinall', identy: '+0015487412360', queue: 'products', activeTime: 15 , channel: 'viber', flag: 'viber.svg', status:  'disconnect', status_color: '#F51F1F'},
    {customerName: 'Addinall Helgass', identy: '+00154785213654', queue: 'services', activeTime: 11 , channel: 'sms', flag: 'sms.svg',  selfJoined: true, status:  'active', status_color: '#29C671'},
    {customerName: 'Ev Gayforth', identy: 'victoria_romero', queue: 'services', activeTime: 12 , channel: 'facebook', flag: 'facebook.svg',  status:  'in_active', status_color: '#B1B1B1'},
    {customerName: 'Glenn Helgass', identy: 'Sandie Friedank', queue: 'marketing', activeTime: 6 , channel: 'web', flag: 'web.svg',  status:  'active', status_color: '#29C671'},
    {customerName: 'Ev Gayforth', identy: 'victoria_romero', queue: 'services', activeTime: 10 , channel: 'facebook', flag: 'facebook.svg',  status:  'busy', status_color: '#B1B1B1'},
    {customerName: 'Adam Stanler', identy: '+0015487412360', queue: 'sales', activeTime: 5 , channel: 'whatsapp', flag: 'whatsapp.svg',  status:  'in_active', status_color: '#B1B1B1'},
    {customerName: 'Fayina Addinall', identy: '+0015487417854', queue: 'products', activeTime: 15 , channel: 'viber', flag: 'viber.svg', selfJoined: true, status:  'active', status_color: '#29C671'},
    {customerName: 'Addinall Helgass', identy: '+0015487412360', queue: 'services', activeTime: 8 , channel: 'sms', flag: 'sms.svg', status:  'active', status_color: '#29C671'},
    {customerName: 'Ev Gayforth', identy: 'victoria_romero', queue: 'services', activeTime: 12 , channel: 'facebook', flag: 'facebook.svg', status:  'active', status_color: '#29C671'},



  ];
  FilterSelected = 'all';
  selectedChat = 'all';
  listPreview = true;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
  }
  listPreviewToggle() {
    this.expandCustomerInfo.emit(this.listPreview = false);
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '490px',
      panelClass: 'confirm-dialog',
      data: { header: 'Close Chat', message: `Are you sure you want to close this Chat?` }

    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
