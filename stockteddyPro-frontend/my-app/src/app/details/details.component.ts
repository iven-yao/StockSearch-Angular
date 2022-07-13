import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendHelperService } from '../backend-helper.service';
import { CandleDAO } from '../dao/candle-dao';
import { EarningsDAO } from '../dao/earnings-dao';
import { NewsDAO } from '../dao/news-dao';
import { Profile2DAO } from '../dao/profile2-dao';
import { QuoteDAO } from '../dao/quote-dao';
import { RecommendationDAO } from '../dao/recommendation-dao';
import { SocialDAO } from '../dao/social-dao';

import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts/highstock';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsComponent } from '../news/news.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { from, Subscription, timer } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';
import { SearchValueService } from '../search-value.service';

declare var require: any;
require('highcharts/indicators/indicators')(Highcharts);
require('highcharts/indicators/volume-by-price')(Highcharts);

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  symbol:string = '';
  closedTime:string = '';
  currentTime: string = '';
  marketOpen:boolean = true;
  validTicker:boolean = true;
  quote:QuoteDAO|undefined;
  profile2:Profile2DAO|undefined;
  candle:CandleDAO|undefined;
  hourlyCandle:CandleDAO|undefined;
  historicalCandle:CandleDAO|undefined;
  peers:[]|undefined;
  topNews:NewsDAO[]|undefined;
  recommendation: RecommendationDAO[]|undefined;
  social: SocialDAO|undefined;
  redditTotalMention: number = 0;
  redditPosMention: number = 0;
  redditNegMention: number = 0;
  twitterTotalMention: number =0;
  twitterPosMention: number =0;
  twitterNegMention: number =0;
  earnings: EarningsDAO[]|undefined;
  subscription: Subscription|undefined;
  isInWatchlist: boolean = false;
  isSellable: boolean = false;

  showBoughtAlert:boolean = false;
  alertMsg_trans:string = '';
  showStarAlert:boolean = false;
  alertMsg_star:string = '';

  Highcharts = Highcharts;
  hourlyChartOptions: Options = {} as Options;
  historicalChartOptions: Options = {} as Options;
  trendsChartOptions: Options = {} as Options;
  epsChartOptions: Options = {} as Options;

  constructor(
    private route: ActivatedRoute,
    private backendHelper: BackendHelperService,
    private newsModalService: NgbModal,
    private transactionService: NgbModal,
    private valueChangeService: SearchValueService
  ) { 

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        this.clearData();
        this.symbol = params.get('ticker')??' '; 
        this.checkExist(this.symbol);
        this.checkLocalStorage();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  sendMessage(ticker:string): void {
    // send message to subscribers via observable subject
    this.valueChangeService.sendUpdate(ticker);
  }

  dismissBoughtAlert() {
    this.showBoughtAlert = false;
  }

  dismissStarAlert() {
    this.showStarAlert = false;
  }

  openTransactionModal(ticker:string, name: string, price:number, isBuy:boolean) {
    this.alertMsg_trans = ticker + (isBuy?' bought':' selled') + ' successfully.';
    const transactionModal = this.transactionService.open(TransactionComponent);
    transactionModal.componentInstance.ticker = ticker;
    transactionModal.componentInstance.name = name;
    transactionModal.componentInstance.price = price;
    transactionModal.componentInstance.isBuy = isBuy;
    transactionModal.result.then(()=> {
      this.showBoughtAlert = true;
      this.checkPortfolio();
    }).catch(err => {
      console.log(err);
    });
  }

  openNewsDetail(news: NewsDAO){
    const newsModal = this.newsModalService.open(NewsComponent);
    newsModal.componentInstance.news = news;
  }

  createEPSChart() {
    let actual = this.earnings?.map((item)=>{ return [item.period+"<br>Surprise:"+item.surprise, item.actual]});
    let estimate = this.earnings?.map((item)=>{ return [item.period+"<br>Surprise:"+item.surprise, item.estimate]});
    let xAxisData = this.earnings?.map((item)=>{ return item.period+"<br>Surprise:"+item.surprise});

    this.epsChartOptions = {
      chart:{
        type:'spline'
      },
      title: {
        text:'Historical EPS Surprises'
      },
      xAxis: {
        categories: xAxisData
      },
      yAxis:{
        title: {
          text:'Quarterly EPS'
        },
        opposite: false
      },
      navigator:{
        enabled:false
      },
      scrollbar:{
        enabled:false
      },
      tooltip:{
        shared: true
      },
      series:[
        {
          name:'Actual',
          type:'spline',
          data:actual
        },
        {
          name:'Estimate',
          type:'spline',
          data:estimate
        }
      ]
    }
  }

  createHistoricalChart() {
    let ohlc = this.historicalCandle?.t.map((val, index) => {
      return [val*1000, 
              this.historicalCandle?.o[index],
              this.historicalCandle?.h[index],
              this.historicalCandle?.l[index],
              this.historicalCandle?.c[index],
            ];
    });

    let v = this.historicalCandle?.t.map((val, index) => {
      return [val*1000,
              this.historicalCandle?.v[index]
            ];
    });

    this.historicalChartOptions = {
      series: [
        {
          data: ohlc,
          type: 'candlestick',
          name: this.symbol,
          id: this.symbol,
          zIndex:2
        },
        {
          data: v,
          type: 'column',
          name: 'Volume',
          id: 'volume',
          yAxis: 1
        },
        {
          type: 'vbp',
          linkedTo: this.symbol,
          params: {
            volumeSeriesID: 'volume'
          },
          dataLabels: {
            enabled: false
          },
          zoneLines: {
            enabled: false
          }

        },
        {
          type: 'sma',
          linkedTo: this.symbol,
          zIndex: 1,
          marker: {
            enabled: false
          }
        }
      ],
      title: {
        text: this.symbol + " Historical"
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      yAxis: [
        {
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          startOnTick: false,
          endOnTick: false,
          resize: {
            enabled: true
          }
        },
        {
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
        }
      ],
      tooltip: {
        split: true
      },
      rangeSelector: {
        buttons: [
          {
            type:'month',
            count: 1,
            text:'1m'
          },
          {
            type:'month',
            count: 3,
            text:'3m'
          },
          {
            type:'month',
            count: 6,
            text:'6m'
          },
          {
            type:'ytd',
            text:'YTD'
          },
          {
            type:'year',
            count: 1,
            text:'1y'
          },
          {
            type:'all',
            text:'All'
          }
        ],
        selected: 2
      },
      time: {
        timezoneOffset: new Date().getTimezoneOffset()
      }
    };
  }

  createTrendsChart() {
    let strongBuyData = this.recommendation?.map( item => item.strongBuy);
    let buyData = this.recommendation?.map( item => item.buy);
    let holdData = this.recommendation?.map( item => item.hold);
    let sellData = this.recommendation?.map( item => item.sell);
    let strongSellData = this.recommendation?.map( item => item.strongSell);
    let xAxisData = this.recommendation?.map( item => item.period.substring(0,7));
    let colorData = ['#176f37','#1db954','#b98b1d','#f45b5b','#813131'];

    console.log(xAxisData);

    this.trendsChartOptions = {
      chart:{
        type:'column'
      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: xAxisData
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis',
        },
        opposite: false
      },
      colors: colorData,
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        floating: false,
        backgroundColor:'white',
        shadow: false
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },
      navigator:{
        enabled:false
      },
      scrollbar:{
        enabled:false
      },
      series:[
        {
          name:'Strong Buy',
          type:'column',
          data: strongBuyData
        },
        {
          name:'Buy',
          type:'column',
          data: buyData
        },
        {
          name:'Hold',
          type:'column',
          data: holdData
        },
        {
          name:'Sell',
          type:'column',
          data: sellData
        },
        {
          name:'Strong Sell',
          type:'column',
          data: strongSellData
        }
      ]
    }
    
  }

  createHourlyChart() {

    let data = this.hourlyCandle?.t.map((val, index) => {
      return [val*1000, this.hourlyCandle?.c[index]];
    });

    this.hourlyChartOptions = {
      series:[
        {
          data: data,
          color: this.quote!.d<0 ? '#FF0000': '#28A745',
          showInNavigator: false,
          name: this.profile2?.ticker,
          type: 'line',
          tooltip: {
            valueDecimals: 2
          }
        }
      ],
      title: {
        text: this.profile2?.ticker + " Hourly Price Variation"
      },
      rangeSelector: {
        enabled: false
      },
      navigator: {
        enabled: false
      },
      time: {
        timezoneOffset: new Date().getTimezoneOffset()
      }
    }
  }

  formattedDateTime(date:Date) {
    return date.getFullYear()+"-"+(date.getMonth() +1)+"-"+date.getDate()+" "+date.toLocaleTimeString('en-GB');
  }

  checkExist(ticker: string) {
    this.backendHelper.getProfile2(ticker).subscribe(
      (values) => {
        this.profile2 = values;
        if(values.ticker) {
          this.validTicker = true;
          this.fetchAll(ticker);
          this.sendMessage(ticker);
        } else {
          this.validTicker = false;
        }
      }
    );
  }

  fetchAll(ticker: string) {
    this.backendHelper.getQuote(ticker).subscribe(
      (values) => {
        this.quote = values;
        this.closedTime = this.formattedDateTime(new Date(values.t*1000));
        this.currentTime = this.formattedDateTime(new Date());
        
        let diff = Math.abs(new Date().getTime()-values.t*1000);
        if( diff <= 60000*5) {
          this.marketOpen = true;
          this.subscription = timer(0, 15000).subscribe(() => {
            this.backendHelper.getQuote(ticker).subscribe(
              (values) => {
                this.quote = values;
                this.closedTime = this.formattedDateTime(new Date(values.t*1000));
                this.currentTime = this.formattedDateTime(new Date());
                console.log(this.quote);
              }
            );
          });
        } else {
          this.marketOpen = false;
        }
        this.backendHelper.getCandle(ticker,'5',values.t-21600,values.t).subscribe(
          (values) => {
            this.hourlyCandle = values;
            this.createHourlyChart();
          }
        );
      }
    );
    

    this.backendHelper.getCandle(ticker,'D', 
      Math.floor(new Date().getTime()/1000-2*365*24*60*60), 
      Math.floor(new Date().getTime()/1000)).subscribe(
        (values) => {
          this.historicalCandle = values;
          this.createHistoricalChart();
        }
    );

    this.backendHelper.getNews(ticker).subscribe(
      (values) => {
        this.topNews = values.slice(0,20);
      }
    );

    this.backendHelper.getRecommendation(ticker).subscribe(
      (values) => {
        this.recommendation = values;
        this.createTrendsChart();
      }
    );

    this.backendHelper.getSocial(ticker).subscribe(
      (values) => {
        this.social = values;
        this.social.reddit.forEach((red)=>{
          this.redditTotalMention += red.mention;
          this.redditPosMention += red.positiveMention;
          this.redditNegMention += red.negativeMention;
        });

        this.social.twitter.forEach((twt)=>{
          this.twitterTotalMention += twt.mention;
          this.twitterPosMention += twt.positiveMention;
          this.twitterNegMention += twt.negativeMention;
        });
      }
    );

    this.backendHelper.getPeers(ticker).subscribe(
      (values) => {
        this.peers = values;
      }
    );

    this.backendHelper.getEarnings(ticker).subscribe(
      (values) => {
        this.earnings = values;
        this.createEPSChart();
      }
    );
  }

  clearData() {
    this.quote = undefined;
    this.profile2 = undefined;
    this.candle = undefined;
    this.peers = undefined;
    this.topNews = undefined;
    this.recommendation = undefined;
    this.social = undefined;
    this.earnings = undefined;
    this.isInWatchlist = false;
    this.isSellable= false;

    this.showBoughtAlert= false;
    this.alertMsg_trans= '';

    this.showStarAlert = false;
    this.alertMsg_star = '';

    this.redditTotalMention = 0;
    this.redditPosMention = 0;
    this.redditNegMention = 0;
    this.twitterTotalMention =0;
    this.twitterPosMention = 0;
    this.twitterNegMention = 0;

    this.subscription?.unsubscribe();

  }

  checkLocalStorage() {
    this.checkWatchlist();
    this.checkPortfolio();

  }

  checkWatchlist() {
    if((JSON.parse(localStorage.getItem('Watchlist')!)??[]).filter((item:any)=> item.ticker == this.symbol).length>0) {
      this.isInWatchlist = true;
    } else {
      this.isInWatchlist = false;
    }
  } 

  checkPortfolio() {
    if((JSON.parse(localStorage.getItem('Portfolio')!)??[]).filter((item:any)=> item.ticker == this.symbol).length>0) {
      this.isSellable = true;
    } else {
      this.isSellable = false;
    }
  }


  clickStar() {
    this.isInWatchlist = !this.isInWatchlist;
    let watchlistItems:any[];

    watchlistItems = JSON.parse(localStorage.getItem('Watchlist')!)??[];
    if(this.isInWatchlist) {
      // add new item in watchlist
      let watchlistNewItem = {
        ticker: this.profile2?.ticker,
        name: this.profile2?.name
      }
      watchlistItems.push(watchlistNewItem);
      localStorage.setItem('Watchlist', JSON.stringify(watchlistItems));
      this.alertMsg_star = this.profile2?.ticker +' added to Watchlist.'
    } else {
      // remove the item from watchlist
      watchlistItems = watchlistItems.filter((item) => item.ticker != this.profile2?.ticker);
      localStorage.setItem('Watchlist', JSON.stringify(watchlistItems));
      this.alertMsg_star = this.profile2?.ticker + ' removed from Watchlist.'
    }

    this.showStarAlert = true;
    
  }

}
