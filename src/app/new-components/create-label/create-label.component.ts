import { Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import {CreateLabelDiagComponent} from './create-label-diag/create-label-diag.component';

@Component({
  selector: 'app-create-label',
  templateUrl: './create-label.component.html',
  styleUrls: ['./create-label.component.scss']
})
export class CreateLabelComponent implements OnInit {

  constructor(private dialog: MatDialog) { }


  showMetaDIv: boolean = false;
  metaDivId;
  labels = [
    {
      color_code: '#039BE6',
      name: 'Corporate',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#0A8043',
      name: 'New products Informaiton',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#D60000',
      name: 'Customer Angry',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#F6BF26',
      name: 'Product Support',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#D60000',
      name: 'CRM Customer',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#7C87CE',
      name: 'Technical Help',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#E77C72',
      name: 'New Customers',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }, {
      color_code: '#7C87CE',
      name: 'Product Issue',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    },
    {
      color_code: '#32B67A',
      name: 'Marketing',
      _id: '',
      created_by: 'farhan',
      createdAt: '14/12/2020',
    }
  ];

  ngOnInit() {
    this.loadLabels();
  }

  loadLabels() {

  }

  createUpdate(label, action) {
    const dialogRef = this.dialog.open(CreateLabelDiagComponent, {
      maxWidth: '568px',
      maxHeight: '184px',
      width: '568px',
      height: '184px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event == 'refresh') {
        this.loadLabels();
      }
    });
  }

  showMeta(id) {
    this.metaDivId = id;
    this.showMetaDIv = true;
  }

  delete(id) {



  }

}
