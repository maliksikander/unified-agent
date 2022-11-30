import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { DateAdapter, MatDialog } from "@angular/material";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { FormControl } from "@angular/forms";
import { httpService } from "../services/http.service";
import { TopicParticipant } from "src/app/models/User/Interfaces";
import { CustomerActionsComponent } from "../customer-actions/customer-actions.component";
import { cacheService } from "../services/cache.service";
import { columnPreferences } from "../column-preferences/column-preferences.component";
import { sharedService } from "../services/shared.service";
import * as moment from "moment";
import { ActivatedRoute, Router } from "@angular/router";
import { socketService } from "../services/socket.service";
import { snackbarService } from "../services/snackbar.service";
import { AngularMultiSelect } from "angular2-multiselect-dropdown";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-phonebook",
  templateUrl: "./phonebook.component.html",
  styleUrls: ["./phonebook.component.scss"]
})
export class PhonebookComponent implements OnInit {
  constructor(
    private _translateService:TranslateService,
    private dateAdapter: DateAdapter<any>,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _httpService: httpService,
    private dialog: MatDialog,
    private _router: Router,
    private route: ActivatedRoute,
    private _socketService: socketService,
    private _snackbarService: snackbarService,
  ) {
    this.dateAdapter.setLocale("en-GB");
     this._translateService.stream('globals.Search').subscribe((data:string)=>
    {
      this.labelSettings.searchPlaceholderText=data;
    })
  }

  customers;
  topicCustomerId;
  paramsSubscription;
  isEmbededView: boolean = false;
  conversationId: string;
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
    searchPlaceholderText:'Search',
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    primaryKey: "_id"
  };
  labels = [];
  selectedSearchField='';
  rows: Array<any> = [];
  cols: Array<any> = [];
  limit = 25;
  filterValue;
  offSet = 0;
  sort = {};
  query = {};
  filterQuery = [];
  enableTable: boolean = false;
  selectedSearchLabel = '';
  submitted: boolean;
  filterOnOff: boolean = false;
  isFilterListOpened: boolean = false;
  filterActiveField;
  removable = true;
  schemaList: Array<any> = [];
  userPreferenceObj;
  @ViewChild('dropdownRef', { static: false }) dropdownRef : AngularMultiSelect;


  ngOnInit() {
    this.processURLParams();
    this.loadLabelsAndCustomer();
  }

  processURLParams() {
    this.paramsSubscription = this.route.queryParams.subscribe((params) => {
      // console.log("params ", params);
      if (params["q"] == "linking") {
        this.isEmbededView = true;
        this.conversationId = params["conversationId"];
        this.topicCustomerId = params["topicCustomerId"];
        if (params["filterKey"]) {
          this.selectedSearchLabel=params["filterLabel"];
          this.selectedSearchField=params["filterKey"];
          this.filterValue = params["filterValue"];
          this.filter(params["filterKey"]);
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

  loadCustomerOnSearchOp(limit, offSet, sort, query) {
    this.getCustomers(limit, offSet, sort, query);
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
        this.enableTable = true;
        let savedPref: Array<any> = res.docs[0].columns;
        this.userPreferenceObj = res.docs[0];
        this.getCustomerSchema(savedPref);
        this.getCustomers(limit, offSet, sort, query);
      } else {
        this._snackbarService.open(this._translateService.instant('snackbar.No-Preference-Added'), "err");
      }

      // this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
      //   this.rows = e.docs;
      //   this.totalRecords = e.totalDocs;
      // });
    });
  }

  getCustomers(limit, offSet, sort, query) {
    this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
      this.rows = e.docs;
      this.totalRecords = e.totalDocs;
    });
  }

  checkForSchemaConsistency(savedPref: Array<any>) {
    let prefArray: Array<any> = savedPref;
    let finalArray: Array<any> = [];
    prefArray.forEach((item) => {
      let schemaIndex = this.schemaList.findIndex((item1) => item1.key == item.field);
      if (schemaIndex != -1) {
        item.channelTypes = this.schemaList[schemaIndex].channelTypes;
        item.header = this.schemaList[schemaIndex].label;
        if(item.field.toLowerCase()!=='labels')
            finalArray.push(item);
      }
    });
    this.cols = finalArray;
  }

  // getChannelTypesFromAttributeKey(key) {
  //   let list: Array<any>;
  //   let temp = this.schemaList.find((item) => item.key == key);
  //   list = temp.channelTypes;
  //   return list;
  // }

  filter(field) {
    if(this.filterValue && field)
    {
    let filterVal = JSON.parse(JSON.stringify(this.filterValue));
    filterVal = encodeURIComponent(filterVal);
    this.query = { field: field, value: filterVal };
    this.filterQuery = [];
    this.filterQuery.push({ field: field, value: this.filterValue });
    // this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
    this.offSet=0;
    this.loadCustomerOnSearchOp(this.limit, this.offSet, this.sort, this.query);
    }
  }

  cancelFilter() {
    this.query = {};
    this.limit = 25;
    this.offSet = 0;
    this.sort = {};
    this.rows = null;
    this.filterValue = null;
    this.selectedSearchField='';
    this.selectedSearchLabel='';
    this.sortArrowDown = false;
    this.sortArrowUp = false;
    this.filterQuery = [];
    this.labelsForFilter.reset();
    this.loadLabelsAndCustomer();
  }

  onPage(event) {
    // console.log("event==>",event)
    this.offSet = event.first;
    this.limit = event.rows;
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
        this.cancelFilter();
      }
    });
  }

  // to open user prefernce dialog
  actions() {
    const dialogRef = this.dialog.open(columnPreferences, {
      maxWidth: "92vw",
      maxHeight: "88vh",
      width: "818px",
      height: "88vh"
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "refresh") {
        this.loadLabelsAndCustomer();
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
      data: { id: id, tab: "edit" }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if ((result && result.event && result.event == "refresh") || (result && result.event && result.event == "delete")) {
       this.loadLabelsAndCustomer()
      }
    });
  }
  //to open conversation view for outbound chat
  openCOnversationView(customer)
  {
    this._socketService.onTopicData({customer}, 'FAKE_CONVERSATION', '')
    this._router.navigate(["customers"]);
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

    this.editPreference(prefObj, this.userPreferenceObj._id);
  }

  editPreference(obj, id) {
    this._httpService.updateUserPreference(obj, id).subscribe(
      (e) => {
        this._sharedService.Interceptor(this._translateService.instant('snackbar.Preference Updated!'), "succ");
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
    let completeSelectedCustomer = {};
    this._sharedService.schema.forEach((e) => {
      if (selectedCustomer.hasOwnProperty(e.key)) {
        completeSelectedCustomer[e.key] = selectedCustomer[e.key];
      } else {
        completeSelectedCustomer[e.key] = e.isChannelIdentifier ? [] : "";
      }
    });
    completeSelectedCustomer["_id"] = selectedCustomer._id;
    this._socketService.linkCustomerWithTopic(completeSelectedCustomer, this.conversationId);
  }
  backToChat() {}
  ngOnDestroy() {
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
    this.dropdownRef.clearSearch();
    this.getCustomers(this.limit, this.offSet, this.sort, this.query);
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
      this.getCustomers(this.limit, this.offSet, this.sort, this.query);
    }
  }
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {
    this.cancelFilter();
  }

  loadLabelsAndCustomer() {
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e;
      this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
    });
  }

  isFilterList() {
    this.isFilterListOpened = !this.isFilterListOpened;
  }

  selectedFilter(e,field){
    this.selectedSearchLabel = e.value;
    this.selectedSearchField = field;
  }
}
