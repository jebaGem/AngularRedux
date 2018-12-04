import { Component, OnInit } from '@angular/core';
import { AppActions } from './store';
@Component({
  selector: 'app',  // tslint:disable-line
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private appActions: AppActions) { }

  ngOnInit(): void {
    this.appActions.getInitData();
    this.appActions.getInitialAccountData();
    this.appActions.getLocale();
  }
}
