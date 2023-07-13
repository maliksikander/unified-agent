import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MAT_SNACK_BAR_DATA, MatDialog, MatSnackBar, MatSnackBarRef} from '@angular/material';
import {CustomerActionsComponent} from '../../customer-actions/customer-actions.component';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {
  phoneNumber = new FormControl('');
  userList: any[] = [
    {
      name: 'Martin Gupital',
      phone: '030012345'

    }, {
      name: 'Alex Henry',
      phone: '0300123456'

    }, {
      name: 'John Brit',
      phone: '0300123456789'

    },
  ]
  filteredOptions: Observable<any[]>;

  constructor(private snackBar: MatSnackBar){}

  ngOnInit() {
    this.filteredOptions = this.phoneNumber.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: any): any[] {
    const filterValue = value.toLowerCase();

    return this.userList.filter(option => option.phone.toLowerCase().includes(filterValue));
  }

  openSnackBar() {
    let snackBar: MatSnackBarRef<SendSmsSnackbarComponent>;
    snackBar = this.snackBar.openFromComponent(SendSmsSnackbarComponent, {
      duration: 200000,
      panelClass: ['chat-success-snackbar', 'send-sms-notify'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      data: {
        preClose: () => {
          snackBar.dismiss(
          );
        }
      }
    });
  }
}


@Component({
  selector: 'app-send-sms-snackbar',
  template: `
  <div class="custom-sms-notification">
      <mat-icon>check_circle</mat-icon>
      <span class="main-notify"><strong>SMS sent successfully </strong>
           The SMS has been sent to the new customer <b>"Jane Doe"</b> on this number 030012345678.<br/> To update the customer profile, <button class="update-new-profile" (click)="updateUser()"> click here</button>
      </span>
      
      <button mat-button color="primary" (click)="dismiss()"></button>
  </div>
  `,

})
export class SendSmsSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data,  private dialog: MatDialog) {}

  updateUser(){
    this.dismiss();
    this.dialog.closeAll();
    this.onRowClick('64a3d6a59ae709b4096d50dc');
  }

  dismiss(){
    console.log(this.data);
    this.data.preClose();
  }

  // to open user customer action dialog
  onRowClick(id) {

    console.log(id, 'iddddddddddddd')
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "edit-customer-dialog",
      maxWidth: "80vw",
      maxHeight: "88vh",
      // width: "818px",
      // height: "88vh",
      data: { id: id }
    });
//   dialogRef.afterClosed().subscribe((result: any) => {
//   if ((result && result.event && result.event == "refresh") || (result && result.event && result.event == "delete")) {
//   this.loadLabelsAndCustomer();
// }
// });
  }
}
