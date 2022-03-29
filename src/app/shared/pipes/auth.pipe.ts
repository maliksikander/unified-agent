import { Pipe, PipeTransform } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

@Pipe({
  name: "authPipe"
})
export class AuthPipe implements PipeTransform {
  constructor(private _authService: AuthService) {}
  transform(resource: any, scope: any): any {
    return this._authService.checkScope(resource, scope);
  }
}
