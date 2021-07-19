import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { FormControl } from "@angular/forms";
import { httpService } from "../services/http.service";
import { CustomerActionsComponent } from "../customer-actions/customer-actions.component";
import { cacheService } from "../services/cache.service";
import { columnPreferences } from "../column-preferences/column-preferences.component";

@Component({
  selector: "app-phonebook",
  templateUrl: "./phonebook.component.html",
  styleUrls: ["./phonebook.component.scss"]
})
export class PhonebookComponent implements OnInit {
  customers;
  totalRecords:number;
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
  labels = [
    {
      createdAt: "2021-03-30T12:09:52.497Z",
      __v: 0,
      name: "dummy",
      updated_by: "",
      _id: "606315109b5372a7aaf57e04",
      created_by: "admin",
      color_code: "#3cb44b",
      updatedAt: "2021-03-30T12:09:52.497Z"
    },
    {
      createdAt: "2021-03-30T12:11:20.124Z",
      __v: 0,
      name: "assasian",
      updated_by: "admin",
      _id: "606315689b53723ed3f57e06",
      created_by: "admin",
      color_code: "#a9a9a9",
      updatedAt: "2021-03-30T12:12:05.258Z"
    }
  ];
  rows = [];
  cols = [];

  filterQuery: string[] = ["Mobile Phone", "Email", "Name", "Business Phone"];

  submitted: boolean;
  filterOnOff: boolean = false;
  filterActiveField;
  removable = true;
  constructor(private _cacheService: cacheService, private _httpService: httpService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadCustomers();
  }
  setFilter(event: Event, col) {
    this.filterOnOff = !this.filterOnOff;
    event.stopPropagation();
    this.filterActiveField = col.field;
  }

  loadCustomers() {
    this._httpService.getUserPreference(this._cacheService.agent.id).subscribe((e) => {
      this.cols = e.data.docs[0].columns;
      this._httpService.getCustomer().subscribe((e) => {
        this.rows = e.data.docs;
        this.totalRecords = e.data.total;
      });
    });
  }

  remove(filter: string): void {
    const index = this.filterQuery.indexOf(filter);

    if (index >= 0) {
      this.filterQuery.splice(index, 1);
    }
  }

  createCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      panelClass: "create-customer-dialog"
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
        this.loadCustomers();
      }
    });
  }
  onItemSelect(item: any) {}
  OnItemDeSelect(item: any) {}
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {}
  onAddItem(items: any) {}

  onRowClick(id, tab, col) {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "inline-editing",
      maxWidth: "848px",
      maxHeight: "88vh",
      width: "848px",
      height: "88vh",
      data: { id: id, tab: tab }
    });
  }
}
function ColumnPreferencesComponent(ColumnPreferencesComponent: any, arg1: { maxWidth: string; maxHeight: string; width: string; height: string }) {
  throw new Error("Function not implemented.");
}
