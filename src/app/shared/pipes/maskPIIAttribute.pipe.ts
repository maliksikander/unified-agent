import { Pipe, PipeTransform } from "@angular/core";
import { CustomerSchema } from "src/app/models/customer-schema";

type schemaAttributes = { isPii: boolean; type: string; key: string };

@Pipe({ name: "maskPIIAttribute", pure: true })
export class maskPIIAttributePipe implements PipeTransform {
  transform(data: String, schema: CustomerSchema | schemaAttributes | null): String | number {
    if (data) {
      // console.log("data is",data)
      // console.log("type is",typeof(data))
      if (schema && schema.isPii && schema.key) {
        if (schema.type.toLocaleLowerCase() == "phonenumber") {
          return this.maskNumber(data);
        } else if (schema.type.toLocaleLowerCase() == "email") {
          return this.maskEmail(data);
        } else if (schema.key.toLocaleLowerCase() != "labels") {
          return this.maskString(data);
        }
      } else {
        return data;
      }
    } else {
      return data;
    }
  }
  maskString(str) {
    let parts = str.split(",");

    // Step 2: Modify and mask the parts
    let maskedParts = parts.map((part) => {
      // Keep the first three characters and mask the rest
      let firstThreeChars = part.substring(0, 3);
      let maskedChars = part.substring(3).replace(/./g, "*");
      return firstThreeChars + maskedChars;
    });

    // Step 3: Join the modified parts back together
    return maskedParts.join(",");
  }

  maskNumber(numStr) {
    let segments = numStr.split(","); // Split based on commas
    let maskedSegments = segments.map((segment) => {
      let trimmedSegment = segment.trim();
      let maskedPart = trimmedSegment.slice(0, -2).replace(/./g, "*"); // Mask all characters except last two
      let lastTwoChars = trimmedSegment.slice(-2); // Get the last two characters
      return maskedPart + lastTwoChars;
    });

    return maskedSegments.join(",");
  }
  maskEmail(email) {
    let [firstPart, secondPart] = email.split("@");
    secondPart = "@" + secondPart;
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
