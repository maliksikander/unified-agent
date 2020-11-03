import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule, MatCardModule,
  MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDrawer, MatExpansionModule, MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatListModule, MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule,
  MatRadioModule, MatSelectModule,
  MatSidenavModule, MatSlideToggleModule, MatSnackBarModule, MatTableModule, MatTabsModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';


@NgModule({
  declarations: [],
  imports: [
    MatIconModule, MatToolbarModule, MatSidenavModule,
    MatCheckboxModule, MatButtonModule,
    MatRadioModule, ReactiveFormsModule,
    MatListModule, MatSnackBarModule, MatTableModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatCardModule, MatChipsModule, MatFormFieldModule,
    MatTabsModule, MatSelectModule, MatInputModule, MatTooltipModule,
    FormsModule, MatExpansionModule, MatMenuModule, MatSlideToggleModule,
    MatAutocompleteModule, MatDialogModule, MatTabsModule,
    MatDatepickerModule, MatNativeDateModule, CommonModule, MatIconModule
  ], exports: [
    MatIconModule, MatToolbarModule, MatSidenavModule,
    MatDrawer, MatCheckboxModule,
    MatButtonModule, MatRadioModule,
    ReactiveFormsModule, MatListModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTableModule, MatProgressBarModule,
    MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatTabsModule, MatSelectModule, MatTooltipModule, FormsModule, MatExpansionModule,
    MatMenuModule, MatSlideToggleModule, MatAutocompleteModule, MatDialogModule, MatTabsModule,
    MatDatepickerModule, MatNativeDateModule, DragDropModule, CommonModule
  ]
})
export class SharedModule { }
