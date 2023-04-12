import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "isPII", pure: true })
export class isPIIPipe implements PipeTransform {
  transform(data: any, isPii: any, type:any, key:any): any {
    if (data) {
      console.log("type is",type)
      console.log("data is",data)
      console.log("isPII is",isPii)



      if (isPii) {
        if(type=='string' && key!='labels')
        {
          console.log("string masking started with ",data)

          return this.maskString(data);
        }
        else if(type=='phoneNumber')
        {
          console.log("phone number masking started with ",data)
          return this.maskNumber(data);

        }
        else if(type=='email')
        {
          console.log("email masking started with ",data)

          return this.maskEmail(data);

        }
  
      } else {
         return data;
      }
    } else {
       return null;
    }
  }
   maskString(str) {
    if (str.length <= 3) {
      return str;
    }
    
    const maskedChars = '*'.repeat(str.length - 3);
    const maskedStr = str.substring(0, 3) + maskedChars;
    
    return maskedStr;
  }

   maskNumber(num) {
    const numStr = num.toString();
    
    if (numStr.length <= 2) {
      return numStr;
    }
    
    const maskedChars = '*'.repeat(numStr.length - 2);
    const maskedNum = maskedChars + numStr.slice(-2);
    
    return maskedNum;
  }
   maskEmail(email) {
    const [firstPart, secondPart] = email.split('@');
    
    let maskedChars;
    let maskedFirstPart;
    let maskedChars2;
    let maskedSecondPart;
    if (firstPart.length <= 4 ) {
      maskedFirstPart=firstPart;    }
    else
    {
      maskedChars = '*'.repeat(firstPart.length - 4);
    maskedFirstPart = firstPart.slice(0, 4) + maskedChars;
    }
    if(secondPart.length <= 4)
    {
      maskedSecondPart=secondPart;
    }
    else
    {
     maskedChars2 = '*'.repeat(secondPart.length - 4);
     maskedSecondPart = maskedChars2 + secondPart.slice(-4);
    }
    
    
    return maskedFirstPart  + maskedSecondPart;
  }
  
}
