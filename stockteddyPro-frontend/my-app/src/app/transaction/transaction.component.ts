import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() public ticker:string = '';
  @Input() public name:string ='';
  @Input() public price:number = 0;
  @Input() public isBuy:boolean = true;
  @Output() broadcast: EventEmitter<any> = new EventEmitter();
  transactionQuantity:number = 0;
  boughtQuantity: number = 0;
  stockItem: any;
  money:number = 0;

  checkStorage() {
    this.money = (JSON.parse(localStorage.getItem('Money')!)??25000).toFixed(2);
    let portfolioJson = JSON.parse(localStorage.getItem('Portfolio')!)??[];
    if(!this.isBuy) {
      this.stockItem = portfolioJson.filter(
        (data:any) => data.ticker == this.ticker
      )[0]
      this.boughtQuantity = this.stockItem.quantity;
    } else {
      this.stockItem = portfolioJson.filter(
        (data:any) => data.ticker == this.ticker
      ).length? portfolioJson.filter(
        (data:any) => data.ticker == this.ticker
      )[0]:
      { ticker: this.ticker, name: this.name, quantity: 0, totalCost: 0};
    }
  }

  public transaction() {
    if(this.isBuy) {
      this.stockItem.quantity += this.transactionQuantity;
      this.stockItem.totalCost += this.transactionQuantity * this.price;
      this.money = Number(this.money) - this.transactionQuantity * this.price;
    } else {
      let avergeCost = this.stockItem.totalCost / this.stockItem.quantity;
      this.stockItem.quantity -= this.transactionQuantity;
      this.stockItem.totalCost -= this.transactionQuantity * avergeCost;
      this.money = Number(this.money) + this.transactionQuantity * this.price;
    }
    let portfolioJson = JSON.parse(localStorage.getItem('Portfolio')!)??[];
    if(this.stockItem.quantity == 0) {
      // delete from locaostorage
      let portfolioReplace = portfolioJson.filter( (data:any) => data.ticker!=this.ticker);
      localStorage.setItem('Portfolio', JSON.stringify(portfolioReplace));
    } else {
      if(portfolioJson.filter((data:any) => data.ticker == this.ticker).length) {
        portfolioJson.forEach((data:any, index:number) => {
          if( data.ticker == this.stockItem.ticker) {
            portfolioJson[index] = this.stockItem;
          }
        });
      } else {
        portfolioJson.push(this.stockItem);
      }

      localStorage.setItem('Portfolio', JSON.stringify(portfolioJson));
    }
    localStorage.setItem('Money', JSON.stringify(this.money));

    this.transactionService.close(this.stockItem);    
  }

  constructor(public transactionService: NgbActiveModal) { }

  ngOnInit(): void {
    this.checkStorage();
  }

}
