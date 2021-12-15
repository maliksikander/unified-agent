import { Component, OnInit, Input } from "@angular/core";
import { DateAdapter, MatDialog } from "@angular/material";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { FormControl } from "@angular/forms";
import { httpService } from "../services/http.service";
import { CustomerActionsComponent } from "../customer-actions/customer-actions.component";
import { cacheService } from "../services/cache.service";
import { columnPreferences } from "../column-preferences/column-preferences.component";
import { sharedService } from "../services/shared.service";
import * as moment from "moment";
import { ActivatedRoute, Router } from "@angular/router";
import { socketService } from "../services/socket.service";

@Component({
  selector: "app-phonebook",
  templateUrl: "./phonebook.component.html",
  styleUrls: ["./phonebook.component.scss"]
})
export class PhonebookComponent implements OnInit {
  customers;
  topicCustomerId;
  paramsSubscription;
  isEmbededView: boolean = false;
  topicId: string;
  stateChangedSubscription;
  totalRecords: number;
  FilterSelected = "action";
  selectedTeam = "us-corporate";
  showLblTooltip: boolean = false;
  LblTooltipId;
  lblSearch: boolean = false;
  labelsForFilter = new FormControl("");
  labelSettings = {
    singleSelection: false,
    text: "",
    searchPlaceholderText: "Search",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    primaryKey: "_id"
  };
  labels = [];
  rows: Array<any> = [];
  cols: Array<any> = [];
  limit = 25;
  filterValue;
  offSet = 1;
  sort = {};
  query = {};
  filterQuery = [];

  submitted: boolean;
  filterOnOff: boolean = false;
  filterActiveField;
  removable = true;
  schemaList: Array<any> = [];

  constructor(
    private dateAdapter: DateAdapter<any>,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _httpService: httpService,
    private dialog: MatDialog,
    private _router: Router,
    private route: ActivatedRoute,
    private _socketService: socketService
  ) {
    this.dateAdapter.setLocale("en-GB");
  }

  ngOnInit() {
    this.processURLParams();
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
    this.stateChangedSubscription = this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      if (e.msg == "update-labels") {
        // this.loadLabels();
      }
    });
  }

  processURLParams() {
    this.paramsSubscription = this.route.queryParams.subscribe((params) => {
      console.log("params ", params);
      if (params["q"] == "linking") {
        this.isEmbededView = true;
        this.topicId = params["topicId"];
        this.topicCustomerId = params["topicCustomerId"];
        if (params["filterKey"]) {
          this.filterValue = params["filterValue"];
          this.filter("", params["filterKey"], "");
        }
      }
    });
  }

  setFilter(event: Event, col) {
    this.filterOnOff = !this.filterOnOff;
    event.stopPropagation();
    this.filterActiveField = col.field;
  }

  loadCustomers(limit, offSet, sort, query) {
    this.rows = null;
    this.getUserPreference(limit, offSet, sort, query);
  }

  getCustomerSchema(savedPref: Array<any>) {
    this._httpService.getCustomerSchema().subscribe((res) => {
      let temp = res.filter((item) => item.key != "isAnonymous");

      this.schemaList = temp.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

      this.checkForSchemaConsistency(savedPref);
      // this.getUserPreference();
    });
  }

  getUserPreference(limit, offSet, sort, query) {
    this._httpService.getUserPreference(this._cacheService.agent.id).subscribe((res) => {
      if (res.docs.length > 0) {
        let savedPref: Array<any> = res.docs[0].columns;
        this.getCustomerSchema(savedPref);
      }

      this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
        this.rows = e.docs;
        this.totalRecords = e.totalDocs;
      });
    });
  }

  checkForSchemaConsistency(savedPref: Array<any>) {
    // console.log("saved array==>", savedPref);
    // console.log("schema ==>", this.columns);
    let array1: Array<any> = [];
    let array2: Array<any> = [];
    let finalArray: Array<any> = [];

    let schemaLength = this.schemaList.length;
    let savedPrefLength = savedPref.length;

    if (schemaLength > savedPrefLength) {
      array1 = this.schemaList;
      array2 = savedPref;
    } else {
      array1 = savedPref;
      array2 = this.schemaList;
    }

    array1.forEach((item1) => {
      array2.forEach((item2) => {
        if (schemaLength > savedPrefLength) {
          if (item1.key == item2.field) {
            item2.channelTypes = item1.channelTypes;
            finalArray.push(item2);
          }
        } else {
          if (item2.key == item1.field) {
            item1.channelTypes = item2.channelTypes;
            finalArray.push(item1);
          }
        }
      });
    });
    this.cols = finalArray;
    // console.log("final ==>", finalArray);
  }

  // getChannelTypesFromAttributeKey(key) {
  //   let list: Array<any>;
  //   let temp = this.schemaList.find((item) => item.key == key);
  //   list = temp.channelTypes;
  //   return list;
  // }

  filter(value, field, v) {
    this.filterValue = encodeURIComponent(this.filterValue);
    this.query = { field: field, value: this.filterValue };
    this.filterQuery = [];
    this.filterQuery.push({ field: field, value: this.filterValue });
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  cancelFilter() {
    this.query = {};
    this.limit = 25;
    this.offSet = 1;
    this.sort = {};
    this.rows = null;
    this.filterValue = null;
    this.sortArrowDown = false;
    this.sortArrowUp = false;
    this.filterQuery = [];
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  onPage(event) {
    this.offSet = event.first;
    this.limit = this.offSet + event.rows;
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  // to open create customer dialog
  createCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      panelClass: "create-customer-dialog",
      maxWidth: "80vw"
      // height: "80vh",
      // maxHeight: "80vh"
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "refresh") {
        this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
      }
    });
  }

  // to open user prefernce dialog
  actions() {
    const dialogRef = this.dialog.open(columnPreferences, {
      maxWidth: "818px",
      maxHeight: "88vh",
      width: "818px",
      height: "88vh"
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "refresh") {
        this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
      }
    });
  }

  // to open user customer action dialog
  onRowClick(id, tab, col) {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "edit-customer-dialog",
      maxWidth: "80vw",
      maxHeight: "88vh",
      // width: "818px",
      // height: "88vh",
      data: { id: id, tab: 'edit' }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if ((result && result.event && result.event == "refresh") || (result && result.event && result.event == "delete")) {
        this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
      }
    });
  }

  onColReorder(event) {
    let prefObj = {
      user_Id: this._cacheService.agent.id,
      pageSize: null,
      columns: event.columns,
      sortOption: [
        {
          field: "",
          sortOption: ""
        }
      ]
    };
    this._httpService.changeUserPreference(prefObj).subscribe(
      (e) => {
        this._sharedService.Interceptor("Preference Updated!", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error, "err");
      }
    );
  }

  sortArrowUp: boolean = false;
  sortArrowDown: boolean = false;
  sortField;

  onSort(field, sortOrder) {
    this.sortField = field;
    if (sortOrder == "asc") {
      this.sortArrowUp = true;
      this.sortArrowDown = false;
    } else {
      this.sortArrowUp = false;
      this.sortArrowDown = true;
    }
    this.sort = { field: field, order: sortOrder };
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  linkCustomer(selectedCustomer) {
    console.log("selected customer fom phonebook ", selectedCustomer);
    this._socketService.linkCustomerWithTopic(JSON.parse(JSON.stringify(selectedCustomer)), this.topicId);
  }
  backToChat() {}
  ngOnDestroy() {
    this.stateChangedSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }

  Cfilter(value, field, v) {
    let b = moment.utc(this.filterValue).utcOffset(-5).toISOString();
    this.filterQuery = [];
    this.filterQuery.push({ field: field, value: b });
    this.query = { field: field, value: b };
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  onItemSelect(item: any) {
    let id = [];
    this.labelsForFilter.value.filter((e) => {
      id.push(e._id);
    });
    let ids = id.toString();
    this.query = { field: "labels", value: ids };
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }
  OnItemDeSelect(item: any) {
    let id = [];
    this.labelsForFilter.value.filter((e) => {
      id.push(e._id);
    });
    if (id[0] == null) {
      this.cancelFilter();
    } else {
      let ids = id.toString();
      this.query = { field: "labels", value: ids };
      this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
    }
  }
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {
    this.cancelFilter();
  }

  // loadLabels() {
  //   this.labels = [];
  //   this._httpService.getLabels().subscribe((e) => {
  //     this.labels = e.data;
  //   });
  // }

  // onItemSelect(item: any) {
  //   let id = [];
  //   this.labelsForFilter.value.filter((e) => {
  //     id.push(e._id);
  //   });
  //   let ids = id.toString();
  //   this.query = { field: "labels", value: ids };
  //   this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  // }

  // OnItemDeSelect(item: any) {
  //   let id = [];
  //   this.labelsForFilter.value.filter((e) => {
  //     id.push(e._id);
  //   });
  //   if (id[0] == null) {
  //     this.cancelFilter();
  //   } else {
  //     let ids = id.toString();
  //     this.query = { field: "labels", value: ids };
  //     this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  //   }
  // }

  // onSelectAll(items: any) {}
  // onDeSelectAll(items: any) {
  //   this.cancelFilter();
  // }
}
