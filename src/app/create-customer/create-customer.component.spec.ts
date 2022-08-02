import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { CreateCustomerComponent } from "./create-customer.component";
import { of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter, MatDialog } from "@angular/material";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";
import { cacheService } from "../services/cache.service";
import { snackbarService } from "../services/snackbar.service";
import { AngularMultiSelect } from "angular2-multiselect-dropdown";
describe("createLabel component", () => {
    let dateAdapter: DateAdapter<any>
    let dialogRef: MatDialogRef<CreateCustomerComponent>;
    let fb: FormBuilder;
    let _httpService: any;
    let _sharedService: any;
    let _cacheService: cacheService;
    let cd: ChangeDetectorRef;
    let snackbarService: snackbarService;
    let fixture: CreateCustomerComponent;
    let spy: any;
    let dialog:MatDialog
    describe("testing create label validators", () => {
        beforeEach(() => {
            _httpService = {
                getLabels: jest.fn(() => { return of([{ name: 'vvip' }]) })
            }
            _sharedService = new sharedService(dialog,snackbarService,_httpService);
            fixture = new CreateCustomerComponent(
                dateAdapter,
                dialogRef,
                {    panelClass: "create-customer-dialog",
                maxWidth: "80vw"},
                fb,
                _httpService,
                _sharedService,
                _cacheService,
                cd,
                snackbarService
            );
        });
        // it('should be invalid if name is empty', () => {
        //     fixture.name.patchValue('');
        //     expect(fixture.name.hasError('required')).toBeTruthy();
        // });
        // it('should be valid if name is not empty and length less than 100', () => {
        //     fixture.name.patchValue('sss');
        //     expect(fixture.name.hasError('required')).toBeFalsy();
        //     expect(fixture.name.hasError('maxlength')).toBeFalsy();

        // });
        // it('should be invalid if name is greater than 100 characters', () => {
        //     fixture.name.patchValue(`qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
        //     qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
        //     qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`);
        //     expect(fixture.name.hasError('maxlength')).toBeTruthy();
        // });
        it('should be invalid if name of the label is already created', () => {
            spy = spyOn(_sharedService, 'snackErrorMessage');
            spyOn(fixture,'onAddItem').and.callThrough();
            expect(_sharedService.snackErrorMessage).toHaveBeenCalledWith('Name already exists');
        });

    })


})