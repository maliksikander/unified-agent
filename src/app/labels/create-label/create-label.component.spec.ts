import { CreateLabelComponent } from "./create-label.component";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { of } from 'rxjs';
describe("createLabel component", () => {
    let fixture: CreateLabelComponent;
    let _httpService: any;
    let _cacheService: cacheService
    let _sharedService: sharedService
    let snackBar: MatSnackBar
    let _translateService:any
    let dialogRef: MatDialogRef<CreateLabelComponent>
    describe("testing create label validators", () => {
        beforeEach(() => {

            _httpService = {
                getLabels: jest.fn(() => { return of([{ name: 'vvip' }]) })
            }
            fixture = new CreateLabelComponent(
                _httpService,
                _cacheService,
                _translateService,
                _sharedService,
                snackBar,
                dialogRef,
                {
                    maxWidth: "568px",
                    width: "568px",
                    label: 'vvip',
                    action: 'new'
                }
            );
        });
        it('should be invalid if name is empty', () => {
            fixture.name.patchValue('');
            expect(fixture.name.hasError('required')).toBeTruthy();
        });
        it('should be valid if name is not empty and length less than 100', () => {
            fixture.name.patchValue('sss');
            expect(fixture.name.hasError('required')).toBeFalsy();
            expect(fixture.name.hasError('maxlength')).toBeFalsy();

        });
        it('should be invalid if name is greater than 100 characters', () => {
            fixture.name.patchValue(`qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`);
            expect(fixture.name.hasError('maxlength')).toBeTruthy();
        });
        it('should be invalid if name of the label is already created', () => {
            fixture.name.patchValue('vvip');

            expect(fixture.name.hasError('validName')).toBeTruthy();
        });

    })


})