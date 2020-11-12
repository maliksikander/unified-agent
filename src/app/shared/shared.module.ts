import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { HttpClientModule } from '@angular/common/http';



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
    MatDatepickerModule, MatNativeDateModule, CommonModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#3f51b5',
      animationDuration: 0,
    }),
    HttpClientModule
  ], exports: [
    MatIconModule, MatToolbarModule, MatSidenavModule,
    MatDrawer, MatCheckboxModule,
    MatButtonModule, MatRadioModule,
    ReactiveFormsModule, MatListModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTableModule, MatProgressBarModule,
    MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatTabsModule, MatSelectModule, MatTooltipModule, FormsModule, MatExpansionModule,
    MatMenuModule, MatSlideToggleModule, MatAutocompleteModule, MatDialogModule, MatTabsModule,
    MatDatepickerModule, MatNativeDateModule, DragDropModule, CommonModule, NgCircleProgressModule,HttpClientModule
  ]
})
export class SharedModule { }
