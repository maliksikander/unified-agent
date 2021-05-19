import { LoginComponent } from "./login.component";
import { FormBuilder } from "@angular/forms";

describe("LoginComponent", () => {
  let fixture: LoginComponent;
  let socketServiceMock: any;
  let cacheServiceMock: any;
  let httpServiceMock: any;
  let formBuilderMock: FormBuilder;
  let routerMock: any;
  let sharedServiceMock: any;
  let appConfigService: any;
  let snackbarService: any;

  beforeEach(() => {
    formBuilderMock = new FormBuilder();
    fixture = new LoginComponent(
      cacheServiceMock,
      httpServiceMock,
      routerMock,
      formBuilderMock,
      sharedServiceMock,
      appConfigService,
      socketServiceMock,
      snackbarService
    );
  });

  describe("Test: Login Form", () => {
    it("should invalidate the form", () => {
      fixture.loginForm.controls.username.setValue("");
      fixture.loginForm.controls.password.setValue("");
      expect(fixture.loginForm.valid).toBeFalsy();
    });

    it("should validate the form", () => {
      fixture.loginForm.controls.username.setValue("demo");
      fixture.loginForm.controls.password.setValue("P@$$W0rd");
      expect(fixture.loginForm.valid).toBeTruthy();
    });
  });
});
