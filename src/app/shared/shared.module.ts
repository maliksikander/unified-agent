import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDrawer,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from "@angular/material";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { NgCircleProgressModule } from "ng-circle-progress";
import { HttpClientModule } from "@angular/common/http";
import { RemoveUnderscorePipe } from "./pipes/underScore.pipe";
import { NgxLinkifyjsModule } from "ngx-linkifyjs";
import { ibsformatPipe } from "./pipes/ibsFormat.pipe";
import { getSenderNamePipe } from "./pipes/getSenderName.pipe";
import { TableModule } from "primeng/table";
import { SliderModule } from "primeng/slider";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { MultiSelectModule } from "primeng/multiselect";
import { ContextMenuModule } from "primeng/contextmenu";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { ProgressBarModule } from "primeng/progressbar";
import { FileUploadModule } from "primeng/fileupload";
import { ToolbarModule } from "primeng/toolbar";
import { RatingModule } from "primeng/rating";
import { RadioButtonModule } from "primeng/radiobutton";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { InputTextareaModule } from "primeng/inputtextarea";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";
import { SearchPipe } from "./pipes/search.pipe";
import { sentenceCasePipe } from "./pipes/sentenceCase.pipe";
import { convertToFormDataPipe } from "./pipes/convertToFormData.pipe";
import { getFirstTwoLettersPipe } from "./pipes/getFirstTwoLetters.pipe";
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from "ngx-mat-datetime-picker";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";


@NgModule({
  declarations: [RemoveUnderscorePipe, ibsformatPipe, getSenderNamePipe, SearchPipe, sentenceCasePipe, convertToFormDataPipe, getFirstTwoLettersPipe],
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatListModule,
    MatSnackBarModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
    MatExpansionModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#3f51b5",
      animationDuration: 0
    }),
    HttpClientModule,
    NgxLinkifyjsModule.forRoot(),
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    HttpClientModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    ConfirmDialogModule,
    InputTextareaModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AngularMultiSelectModule
  ],
  exports: [
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDrawer,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    MatExpansionModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    CommonModule,
    NgCircleProgressModule,
    HttpClientModule,
    RemoveUnderscorePipe,
    NgxLinkifyjsModule,
    ibsformatPipe,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    HttpClientModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    ConfirmDialogModule,
    InputTextareaModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    SearchPipe,
    getSenderNamePipe,
    sentenceCasePipe,
    convertToFormDataPipe,
    getFirstTwoLettersPipe,
    AngularMultiSelectModule
  ]
})
export class SharedModule { }
