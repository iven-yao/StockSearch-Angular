import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule} from '@angular/router';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';

import { AppComponent } from './app.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { FooterComponent } from './footer/footer.component';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { BackendHelperService } from './backend-helper.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailsComponent } from './details/details.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { NewsComponent } from './news/news.component';
import { TransactionComponent } from './transaction/transaction.component';


const appRoutes: Routes = [
  { path: '', redirectTo:'/search/home', pathMatch:'full'},
  { path: 'watchlist', component: WatchlistComponent},
  { path: 'portfolio', component: PortfolioComponent},
  { path: 'search/home', component: SearchComponent, pathMatch:'full'},
  { path: 'search/:ticker', component: DetailsComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    FooterComponent,
    SearchComponent,
    WatchlistComponent,
    PortfolioComponent,
    DetailsComponent,
    NewsComponent,
    TransactionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { onSameUrlNavigation:'reload',useHash:true}
    ),
    BrowserAnimationsModule,
    NgbModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    HighchartsChartModule
  ],
  providers: [BackendHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
