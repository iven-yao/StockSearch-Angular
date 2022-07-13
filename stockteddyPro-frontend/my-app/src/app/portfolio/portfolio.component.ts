import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendHelperService } from '../backend-helper.service';
import { TransactionComponent } from '../transaction/transaction.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  portfolioItems:any;
  allInfo:any[] = [];
  isEmpty:boolean = false;
  money:number=0;

  constructor(private backendHelper: BackendHelperService,
              private transactionService: NgbModal
    ) { }

  openTransactionModal(ticker:string, name: string, price:number, isBuy:boolean) {
    const transactionModal = this.transactionService.open(TransactionComponent);
    transactionModal.componentInstance.ticker = ticker;
    transactionModal.componentInstance.name = name;
    transactionModal.componentInstance.price = price;
    transactionModal.componentInstance.isBuy = isBuy;
    transactionModal.result.then(() => {
      this.reloadAllData();
    })
  }

  getLocalStorage() {
    this.portfolioItems = JSON.parse(localStorage.getItem('Portfolio')!)??[];
    this.money = (JSON.parse(localStorage.getItem('Money')!)??25000);
    this.isEmpty = this.portfolioItems.length == 0;
  }

  getCurrentPrice() {
    this.portfolioItems.forEach((item:any) => {
      this.backendHelper.getQuote(item.ticker).subscribe((quote) => {
        let avgCost = item.totalCost/item.quantity;
        let info = {
          ticker: item.ticker,
          name: item.name,
          quantity: item.quantity,
          totalCost: item.totalCost,
          avgCost: avgCost,
          c: quote.c,
          change: (quote.c -avgCost),
          marketValue: (quote.c*item.quantity)
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

  ngOnInit(): void {
    this.reloadAllData();
  }

}
