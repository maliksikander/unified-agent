import { CreateLabelComponent } from "./create-label.component";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { of } from 'rxjs';
describe("createLabel component", () => {
    let fixture:CreateLabelComponent;
            let _httpService: any;
            let _cacheService: cacheService
            let _sharedService: sharedService
            let snackBar: MatSnackBar
            let dialogRef: MatDialogRef<CreateLabelComponent>
    describe("testing create label validators", () => {
        beforeEach(() => {

            _httpService={
                getLabels:jest.fn(()=>{return of(['vvip'])})
            }
            fixture = new CreateLabelComponent(
                _httpService,
                _cacheService,
                _sharedService,
                snackBar,
                dialogRef,
                {
                    maxWidth: "568px",
                    width: "568px",
                    data: { label: '', action: 'new' }
                }
            );
        });
        it('should be invalid if name is empty',()=>
        {
            fixture.name.patchValue('');
            expect(fixture.name.hasError('required')).toBeTruthy();
        });
        it('should be invalid if name is greater than 100 characters',()=>
        {
            fixture.name.patchValue(`qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
            qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`);
            expect(fixture.name.hasError('maxlength')).toBeTruthy();
        });

    })
    

})