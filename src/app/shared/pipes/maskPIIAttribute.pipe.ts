import { Pipe, PipeTransform } from "@angular/core";
import { CustomerSchema } from "src/app/models/customer-schema";

type schemaAttributes={isPii:boolean , type:string , key: string}


@Pipe({ name: "maskPIIAttribute", pure: true })
export class maskPIIAttributePipe implements PipeTransform {

  transform(data: String | number, schema: CustomerSchema | schemaAttributes | null ): String | number {
    if (data) {
      if (schema && schema.isPii && schema.key) {
        console.log("schema",schema)
        if (schema.type.toLocaleLowerCase() == "string" && schema.key.toLocaleLowerCase() != "labels") {
          return this.maskString(data);
        } else if (schema.type.toLocaleLowerCase() == "phonenumber") {
          return this.maskNumber(data);
        } else if (schema.type.toLocaleLowerCase()== "email") {
          return this.maskEmail(data);
        }
      } else {
        return data;
      }
    } else {
      return data;
    }
  }
  maskString(str) {
    if (str.length <= 3) {
      return str;
    }

    const maskedChars = "*".repeat(str.length - 3);
    const maskedStr = str.substring(0, 3) + maskedChars;

    return maskedStr;
  }

  maskNumber(num) {
    const numStr = num.toString();

    if (numStr.length <= 2) {
      return numStr;
    }

    const maskedChars = "*".repeat(numStr.length - 2);
    const maskedNum = maskedChars + numStr.slice(-2);

    return maskedNum;
  }
  maskEmail(email) {
    const [firstPart, secondPart] = email.split("@");

    let maskedChars;
    let maskedFirstPart;
    let maskedChars2;
    let maskedSecondPart;
    if (firstPart.length <= 4) {
      maskedFirstPart = firstPart;
    } else {
      maskedChars = "*".repeat(firstPart.length - 4);
      maskedFirstPart = firstPart.slice(0, 4) + maskedChars;
    }
    if (secondPart.length <= 4) {
      maskedSecondPart = secondPart;
    } else {
      maskedChars2 = "*".repeat(secondPart.length - 4);
      maskedSecondPart = maskedChars2 + secondPart.slice(-4);
    }

    return maskedFirstPart + maskedSecondPart;
  }
}
