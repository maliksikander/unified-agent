import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fetchLabels' })
export class fetchLabelsPipe implements PipeTransform {
    transform(labels: any, ids?: any): any {
        let customerLabels = [];
        if(ids && labels && ids[0] != null && labels[0] != null){
        ids.filter((id) => {
            labels.filter((label) => {

                if (label._id == id) {
                    customerLabels.push(label)
                }
            })
        });
        return customerLabels;
    }else{
        return null;
    }

    }
}