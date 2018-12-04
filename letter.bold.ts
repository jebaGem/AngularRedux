import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'letterBold' })
export class LetterBoldPipe implements PipeTransform {
  transform(value: any, search: any): any {
    if (!search) { return value; }
    const searchLength = search.length;
    const holder = value.split('');
    let indexAdder = 0;
    let indexs = this.searchSubString(search.toLowerCase(), value.toLowerCase());
    indexs = indexs.map((x) => {
      const solution = x + indexAdder;
      indexAdder += 2;
      return solution;
    });
    indexs.forEach((i) => {
      holder.splice(i, 0, '<span>');
      holder.splice(i + searchLength + 1, 0, '</span>');
    });
    return holder.join('');
  }

  searchSubString(substring, searchValue) {
    const indexs = [];
    let i = -1;
    while ((i = searchValue.indexOf(substring, i + 1)) >= 0) {
      indexs.push(i);
    }
    return indexs;
  }
}
