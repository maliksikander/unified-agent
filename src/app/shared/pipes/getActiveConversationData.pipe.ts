import { Pipe, PipeTransform } from "@angular/core";
import { httpService } from "src/app/services/http.service";

@Pipe({ name: "activeConversation" })
export class activeConversationPipe implements PipeTransform {
  constructor(private _httpService: httpService) {}
  transform(conversationId: any): any {
    return new Promise((reject, resolve) => {
      console.log("called");
      if (conversationId) {
        console.log("con", conversationId);
        this._httpService.getActiveConversationData(conversationId).subscribe(
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
