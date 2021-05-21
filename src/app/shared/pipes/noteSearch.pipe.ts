import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'NoteFilter'
})

export class NoteSearchPipe implements PipeTransform {
  transform(notes: any, inputValue?: any, searchIn?: any): any {

    if(!notes)return null;
    if(!inputValue)return notes;

    console.log('notes', notes)
    console.log('inputValue', inputValue)
    console.log('searchIn', searchIn)

// let finalArray: any;
    if (searchIn == 'categoryName') {
      return  notes.filter(function(note) {
        return JSON.stringify(note.categoryName).toLowerCase().includes(inputValue.toLowerCase());
      });

    }
  }
}

