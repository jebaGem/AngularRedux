import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchFilter' })
export class SearchFilterPipe implements PipeTransform {
  transform(value: any, search: string, filterProperty): any {
    if (!filterProperty) { throw Error('please provide the filterProperty parameter'); }
    if (!search) { return value; }
    const solution = value.filter(v => {
      if (!v) { return; }
      return v[filterProperty].toLowerCase().indexOf(search.toLowerCase()) !== -1;
    });
    return solution;
  }
}
