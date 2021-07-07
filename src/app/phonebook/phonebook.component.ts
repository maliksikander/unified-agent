import { Component, OnInit, Input } from '@angular/core';
import {MatDialog} from '@angular/material';
import {CreateCustomerComponent} from '../create-customer/create-customer.component';
import {FormControl} from '@angular/forms';
import { LazyLoadEvent } from 'primeng/primeng';
import { httpService } from '../services/http.service';
import { CustomerActionsComponent } from '../customer-actions/customer-actions.component';

@Component({
  selector: 'app-phonebook',
  templateUrl: './phonebook.component.html',
  styleUrls: ['./phonebook.component.scss']
})
export class PhonebookComponent implements OnInit {
  customers;
  FilterSelected = 'action';
  selectedTeam = 'us-corporate';
  showLblTooltip: boolean = false;
  LblTooltipId;
  lblSearch: boolean = false;
  labelsForFilter = new FormControl('');
  labelSettings = {
    singleSelection: false,
    text: "",
    searchPlaceholderText: 'Search',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    primaryKey: "_id"
  };
  labels = [
    {
      "createdAt": "2021-03-30T12:09:52.497Z",
      "__v": 0,
      "name": "dummy",
      "updated_by": "",
      "_id": "606315109b5372a7aaf57e04",
      "created_by": "admin",
      "color_code": "#3cb44b",
      "updatedAt": "2021-03-30T12:09:52.497Z"
    },
    {
      "createdAt": "2021-03-30T12:11:20.124Z",
      "__v": 0,
      "name": "assasian",
      "updated_by": "admin",
      "_id": "606315689b53723ed3f57e06",
      "created_by": "admin",
      "color_code": "#a9a9a9",
      "updatedAt": "2021-03-30T12:12:05.258Z"
    }
  ];
  rows = [
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3455de812695676383d2"
      ],
      "phone1": "0000",
      "createdAt": "2020-12-05T07:51:33.560Z",
      "updated_by": "",
      "_id": "5fcb3c057ac040dfa6527e84",
      "first_name": "Gold",
      "email": "",
      "updatedAt": "2020-12-05T07:51:33.560Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3460de8126013d6383d3"
      ],
      "phone1": "2323",
      "createdAt": "2020-12-05T06:12:35.055Z",
      "updated_by": "",
      "_id": "5fcb24d37ac040be71527e83",
      "first_name": "HC Test 2",
      "email": "",
      "updatedAt": "2020-12-05T06:12:35.055Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3460de8126013d6383d3"
      ],
      "phone1": "2121",
      "createdAt": "2020-12-04T11:56:54.740Z",

      "updated_by": "",
      "_id": "5fca24067ac040705d527e82",
      "first_name": "TestHC",
      "email": "",
      "updatedAt": "2020-12-04T11:56:54.740Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3460de8126013d6383d3"
      ],
      "phone1": "+923360110708",
      "createdAt": "2020-11-18T11:47:08.128Z",

      "updated_by": "admin",
      "_id": "5fb509bc7ac040b80d527e81",
      "first_name": "Alex",
      "email": "",
      "updatedAt": "2020-11-18T12:25:41.763Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5fb3b6d37ac04007e5527e7f"
      ],
      "phone1": "1234567",
      "createdAt": "2020-11-17T11:41:31.471Z",

      "updated_by": "admin",
      "_id": "5fb3b6eb7ac0406ac0527e80",
      "first_name": "bronze",
      "email": "",
      "updatedAt": "2020-11-17T11:41:51.932Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5f7b11de6ecd9f4396b9be0c"
      ],
      "phone1": "123456",
      "createdAt": "2020-11-17T11:32:59.708Z",

      "updated_by": "",
      "_id": "5fb3b4eb7ac0403c82527e7e",
      "first_name": "expertflow",
      "email": "",
      "updatedAt": "2020-11-17T11:32:59.708Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb34a7de8126ea486383d6"
      ],
      "phone1": "12345",
      "createdAt": "2020-11-17T11:30:55.404Z",

      "updated_by": "",
      "_id": "5fb3b46f7ac040aa4c527e7d",
      "first_name": "support",
      "email": "",
      "updatedAt": "2020-11-17T11:30:55.404Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb348dde81262a576383d4"
      ],
      "phone1": "1122",
      "createdAt": "2020-11-17T08:11:38.573Z",

      "updated_by": "",
      "_id": "5fb385ba7ac0407ad2527e7c",
      "first_name": "customer",
      "email": "",
      "updatedAt": "2020-11-17T08:11:38.573Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3455de812695676383d2"
      ],
      "phone1": "1234",
      "createdAt": "2020-11-17T07:02:57.196Z",

      "updated_by": "",
      "_id": "5fb375a17ac040df5f527e7b",
      "first_name": "umar",
      "email": "",
      "updatedAt": "2020-11-17T07:02:57.196Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3460de8126013d6383d3",
        "5eeb3455de812695676383d2"
      ],
      "phone1": "43517",
      "createdAt": "2020-06-18T09:34:34.994Z",

      "updated_by": "admin",
      "_id": "5eeb352ade812662716383dc",
      "first_name": "mixed",
      "email": "",
      "updatedAt": "2020-11-17T06:57:17.041Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb348dde81262a576383d4"
      ],
      "phone1": "43516",
      "createdAt": "2020-06-18T09:34:06.803Z",

      "updated_by": "admin",
      "_id": "5eeb350ede812602d46383db",
      "first_name": "Platinum",
      "email": "",
      "updatedAt": "2020-11-17T08:46:27.399Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb34a7de8126ea486383d6"
      ],
      "phone1": "4444",
      "createdAt": "2020-06-18T09:33:48.508Z",

      "updated_by": "",
      "_id": "5eeb34fcde81265b7f6383da",
      "first_name": "vvip",
      "email": "",
      "updatedAt": "2020-06-18T09:33:48.508Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3499de8126f6b26383d5",
        "5eeb3460de8126013d6383d3",
        "5eeb348dde81262a576383d4"
      ],
      "phone1": "3333",
      "createdAt": "2020-06-18T09:33:29.191Z",

      "updated_by": "admin",
      "_id": "5eeb34e9de8126962b6383d9",
      "first_name": "Vip",
      "email": "",
      "updatedAt": "2020-11-17T12:03:33.721Z"
    },
    {
      "phone2": "",
      "last_name": "",
      "phone3": "",
      "phone4": "",
      "phone5": "",
      "created_by": "admin",
      "labels": [
        "5eeb3460de8126013d6383d3",
        "5eeb3499de8126f6b26383d5"
      ],
      "phone1": "1111",
      "createdAt": "2020-06-18T09:33:09.748Z",

      "updated_by": "admin",
      "_id": "5eeb34d5de812690996383d8",
      "first_name": "Silver",
      "email": "",
      "updatedAt": "2020-11-17T08:50:34.070Z"
    }
  ];
cols = [
  {
    "field": "first_name",
    "header": "First Name",
    "type": "string"
  },
  {
    "field": "last_name",
    "header": "Last Name",
    "type": "string"
  },
  {
    "field": "phone1",
    "header": "Phone1",
    "type": "phone"
  },
  {
    "field": "email",
    "header": "Email",
    "type": "email"
  },
  {
    "field": "phone2",
    "header": "Phone2",
    "type": "phone"
  },
  {
    "field": "created_by",
    "header": "Created By",
    "type": "string"
  },
  {
    "field": "updated_by",
    "header": "Updated By",
    "type": "string"
  }
];


  filterQuery: string[] = ['Mobile Phone', 'Email', 'Name', 'Business Phone'];

  submitted: boolean;
  filterOnOff: boolean = false;
  filterActiveField;
  removable = true;
  constructor(private _httpService: httpService,private dialog: MatDialog) { }

  ngOnInit() {
    this.loadCustomers()
  }
  setFilter(event: Event, col) {
    this.filterOnOff = !this.filterOnOff;
    event.stopPropagation();
    this.filterActiveField = col.field;
  }


  loadCustomers(){

    // this._httpService.getCustomerSchema().subscribe((e)=>{
    //   this.cols = e.data;
      this._httpService.getCustomer().subscribe((e)=>{
        this.rows = e.data.docs;
      })
 //   })

  }


  onLazyLoad(event: LazyLoadEvent) {

  }

  remove(filter: string): void {
    const index = this.filterQuery.indexOf(filter);

    if (index >= 0) {
      this.filterQuery.splice(index, 1);
    }
  }

  createCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      panelClass: 'create-customer-dialog',

    });
  }
  actions() {
    // const dialogRef = this.dialog.open(ColumnPreferencesComponent, {
    //   maxWidth: '818px',
    //   maxHeight: '88vh',
    //   width: '818px',
    //   height: '88vh',

    // });
  }
  onItemSelect(item: any) {

  }
  OnItemDeSelect(item: any) {

  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
  }
  onAddItem(items: any) {
  }

  onRowClick(id, tab, col) {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: 'inline-editing',
      maxWidth: '848px',
      maxHeight: '88vh',
      width: '848px',
      height: '88vh',
      data: { id: id, tab: tab }

    });
  }

}

