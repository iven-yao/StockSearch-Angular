import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendHelperService } from '../backend-helper.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  isEmpty:boolean = true;
  watchListItems:any;
  allInfo:any[] = [];


  constructor(private backendHelper: BackendHelperService,
    private router: Router) { }

  getLocalStorage() {
    this.watchListItems = JSON.parse(localStorage.getItem('Watchlist')!)??[];
    this.isEmpty = this.watchListItems.length == 0;
  }

  getCurrentPrice() {
    this.watchListItems.forEach((item:any) => {
      this.backendHelper.getQuote(item.ticker).subscribe((quote) => {
        let info = {
          ticker: item.ticker,
          name: item.name,
          c: quote.c,
          d: quote.d,
          dp: quote.dp
        };
        this.allInfo.push(info);
      })
    });
  }

  reloadAllData() {
    this.allInfo = [];
    this.getLocalStorage();
    this.getCurrentPrice();
  }

  gotoTicker(ticker:string) {
    this.router.navigateByUrl('/search/'+ticker);
  }

  removeFromWatchlist(ticker:string) {
    let watchlistItems:any[];
    watchlistItems = JSON.parse(localStorage.getItem('Watchlist')!)??[];
    watchlistItems = watchlistItems.filter((item) => item.ticker != ticker);
    localStorage.setItem('Watchlist', JSON.stringify(watchlistItems));
    this.reloadAllData();
  }

  ngOnInit(): void {
    this.reloadAllData();
  }

}
