import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { httpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-create-attribute',
  templateUrl: './create-attribute.component.html',
  styleUrls: ['./create-attribute.component.scss']
})
export class CreateAttributeComponent implements OnInit {


  columnTypes = ['string', 'phone', 'email', 'date', 'date Time', 'time', 'url', 'bool'];
  columnTypeControllar = 'string';
  mandatory: boolean = false;
  channelIden: boolean = false;
  selectedChannel;
  attributesData;

  textLength = new FormControl('50', [Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]);
  label = new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]
    , this.ValidateNameDuplication.bind(this));
  desc = new FormControl('', [Validators.maxLength(100)]);
  selectChannel = new FormControl();
  channelList: string[] = ['WEB', 'FACEBOOK', 'WHATSAPP', 'VIBER', 'SMS', 'GENERIC'];

  constructor(private _httpService: httpService, public snackBar: MatSnackBar, public dialogRef: MatDialogRef<CreateAttributeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.attributesData = this.data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  makeObject() {
    let txtLength = this.textLength.value;
    let trimmedlbl = this.label.value.trim();


    if (this.columnTypeControllar == 'url') {
      txtLength = 2083;
    }

    if (this.columnTypeControllar != 'url' && this.columnTypeControllar != 'string') {
      txtLength = null;
    }


    let obj = {
      'label': trimmedlbl, 'key': this.camelize(trimmedlbl),
      'type': this.columnTypeControllar.replace(/\s+/g, '_').toLowerCase(), 'is_required': this.mandatory, 'desc': this.desc.value,
      'characters': txtLength, 'channels': this.selectChannel.value ? this.selectChannel.value : [], 'is_channel_identifier': this.channelIden
    }

    console.log(obj)

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

   camelize(str) {
    return str
    .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
    .replace(/\s/g, '')
    .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
  }

  onTypeChange(type) {
    if (type == 'string') {
      this.textLength.setValidators([Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)])
    } else {
      this.textLength.clearValidators()

    }
    this.textLength.updateValueAndValidity()
  }

  ValidateNameDuplication(control: AbstractControl) {
    return this._httpService.getCustomerSchema().pipe(map(
      e => {
        const schema = e.data;

        if ((schema.find(e => e.label.toLowerCase() == control.value.toLowerCase()))) {
          return { validName: true };
        }
      }
    ));

    return null;
  }

}
