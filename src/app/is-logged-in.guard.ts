import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { cacheService } from './services/cache.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {

  constructor(private _cacheService: cacheService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    if (this._cacheService.agent && this._cacheService.agent.id && this._cacheService.agent.username) {
      return true;
    } else {
      return false;
    }

  }

}
