import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchValueService {
  
  private searchValueChange = new Subject<any>();

  sendUpdate(message: string) {
    this.searchValueChange.next({text: message});
  }

  getUpdate() : Observable<any> {
    return this.searchValueChange.asObservable();
  }

  constructor() { }


}
