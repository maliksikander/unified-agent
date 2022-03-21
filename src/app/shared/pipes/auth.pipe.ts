import { Pipe, PipeTransform } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

@Pipe({
  name: "authPipe"
})
export class AuthPipe implements PipeTransform {
  constructor(private _authService: AuthService) {}
  transform(resource: any, ...args: any[]): any {
    // console.log("pipe value==>", resource);
    // console.log("args==>", args);
    let scope = args[0];
    // if (args[0] == "manage") {
    return this._authService.checkScope(resource, scope);
    // } else {
    // return this._authService.checkViewScope(value);
    // }
  }
}
