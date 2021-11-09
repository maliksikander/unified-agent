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

@Component({
  selector: "app-phonebook",
  templateUrl: "./phonebook.component.html",
  styleUrls: ["./phonebook.component.scss"]
})
export class PhonebookComponent implements OnInit {
  customers;
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
  rows = [];
  cols = [];
  limit = 25;
  filterValue;
  offSet = 0;
  sort = {};
  query = {};
  filterQuery: string[] = [];

  submitted: boolean;
  filterOnOff: boolean = false;
  filterActiveField;
  removable = true;
  constructor(
    private dateAdapter: DateAdapter<any>,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _httpService: httpService,
    private dialog: MatDialog
  ) {
    this.dateAdapter.setLocale("en-GB");
  }

  ngOnInit() {
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
    this.stateChangedSubscription = this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      if (e.msg == "update-labels") {
        this.loadLabels();
      }
    });
  }
  setFilter(event: Event, col) {
    this.filterOnOff = !this.filterOnOff;
    event.stopPropagation();
    this.filterActiveField = col.field;
  }

  loadLabels() {
    this.labels = [];
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e.data;
    });
  }

  loadCustomers(limit, offSet, sort, query) {
    this.rows = null;
    this._httpService.getUserPreference(this._cacheService.agent.id).subscribe((e) => {
      this.cols = e.data.docs[0].columns;
      this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
        this.rows = e.data.docs;
        this.totalRecords = e.data.total;
        this.loadLabels();
      });
    });
  }

  filter(value, field, v) {
    this.query = { field: field, value: encodeURIComponent(this.filterValue) };
    this.filterQuery = [];
    this.filterQuery.push(field + ":" + this.filterValue);
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  Cfilter(value, field, v) {
    let b = moment.utc(this.filterValue).utcOffset(-5).toISOString();
    this.filterQuery = [];
    this.filterQuery.push(field + ":" + b);
    this.query = { field: field, value: b };
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  cancelFilter() {
    this.query = {};
    this.limit = 25;
    this.offSet = 0;
    this.sort = {};
    this.rows = null;
    this.filterValue = null;
    this.sortArrowDown = false;
    this.sortArrowUp = false;
    this.filterQuery = [];
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  onPage(event) {
    console.log(event);
    this.offSet = event.first;
    this.limit = this.offSet + event.rows;
    this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
  }

  createCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      panelClass: "create-customer-dialog",
      maxWidth: "58vw",
      height: "79vh",
      maxHeight: "79vh"
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "refresh") {
        this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
      }
    });
  }

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

  onRowClick(id, tab, col) {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "inline-editing",
      maxWidth: "848px",
      maxHeight: "88vh",
      minHeight: "25vh",
      data: { id: id, tab: tab }
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

  ngOnDestroy() {
    this.stateChangedSubscription.unsubscribe();
  }
}
