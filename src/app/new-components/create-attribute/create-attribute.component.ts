import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-attribute',
  templateUrl: './create-attribute.component.html',
  styleUrls: ['./create-attribute.component.scss']
})
export class CreateAttributeComponent implements OnInit {


  columnTypes = ['Text', 'Phone', 'Email', 'Date', 'Date Time', 'Time', 'URL', 'Bool'];
  channels = ['Landline', 'Mobile'];
  columnTypeControllar = 'Text';
  mandatory = false;
  channelIden = false;
  selectedChannel = 'Landline';
  attributesData;

  textLength = new FormControl('50', [Validators.pattern('^[0-9]*$'), Validators.required, Validators.min(1), Validators.max(1000)]);
  label = new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]
  , this.ValidateNameDuplication.bind(this));
  defaultValue = new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]
  , this.ValidateNameDuplication.bind(this));
  desc = new FormControl('', [Validators.maxLength(100)]);
  selectChannel = new FormControl();
  channelList: any[] = [{
    channel_name: 'whatsapp',
    channel_icon: 'assets/images/whatsapp-colored.svg'
  }, {
    channel_name: 'facebook',
    channel_icon: 'assets/images/facebook-colored.svg'
  }, {
    channel_name: 'email',
    channel_icon: 'assets/images/envelope-colored.svg'
  }, {
    channel_name: 'skype',
    channel_icon: 'assets/images/skype-colored.svg'
  }, {
    channel_name: 'landline',
    channel_icon: 'assets/images/landline-phone-colored.svg'
  }, {
    channel_name: 'phone',
    channel_icon: 'assets/images/phone-colored.svg'
  }];

  constructor( public snackBar: MatSnackBar, public dialogRef: MatDialogRef<CreateAttributeComponent>,
               @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.attributesData = this.data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  makeObject() {
    let txtLength = this.textLength.value;
    let slctdChnl = this.selectedChannel;
    const trimmedlbl = this.label.value.trim();


    if (this.columnTypeControllar == 'URL') {
      txtLength = 2083;
    }

    if (this.columnTypeControllar != 'URL' && this.columnTypeControllar != 'Text' ) {
      txtLength = null;
    }

    if (this.columnTypeControllar == 'Text') {
      this.columnTypeControllar = 'string';
    }

    if (this.channelIden == false) {
      slctdChnl = null;
    } else {
      slctdChnl = slctdChnl.replace(/\s+/g, '_').toLowerCase();
    }

    const obj = {
      label: trimmedlbl, key: trimmedlbl.replace(/\s+/g, '_').toLowerCase(),
      type: this.columnTypeControllar.replace(/\s+/g, '_').toLowerCase(), is_required: this.mandatory, desc: this.desc.value,
      characters: txtLength, channel: slctdChnl
    };

    // this._callService.createSchemaAttribute(obj).subscribe((e) => {
    //   this._callService.Interceptor("Attribute-Created",'succ');
    //   this.dialogRef.close({ event: 'refresh' });
    //
    //   // const dialogRef = this.dialog.open(CreateAttributeComponent, {
    //   //   maxWidth: '815px',
    //   //   maxHeight: '331px',
    //   //   width: '815px',
    //   //   height: '331px',
    //   // });
    //
    //   // dialogRef.afterClosed().subscribe(result => {
    //   // });
    //
    //
    // }, (error) => {
    //   // this._callService.Interceptor(error,'err');
    // });

  }

  ValidateNameDuplication(control: AbstractControl) {
    // return this._callService.getContactSchema().pipe(map(
    //   e => {
    //     const schema = e;
    //
    //     if ((schema.find(e => e.label.toLowerCase() == control.value.toLowerCase()))) {
    //       return { validName: true };
    //     }
    //   }
    // ));
    //
    // return null;
  }

}
