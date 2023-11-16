import { Pipe, PipeTransform } from "@angular/core";
import { httpService } from "src/app/services/http.service";

@Pipe({ name: "activeConversation" })
export class activeConversationPipe implements PipeTransform {
  constructor(private _httpService: httpService) {}
  transform(roomId: any): any {
    return new Promise((reject, resolve) => {
      if (roomId) {
        this._httpService.getActiveConversationData(roomId).subscribe(
          (data) => {
            resolve(data);
          },
          (err) => {
            reject(false);
          }
        );
      } else {
        reject(false);
      }
    });
  }
}
