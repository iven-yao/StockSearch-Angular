import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { switchMap, debounceTime, tap, finalize, map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BackendHelperService } from '../backend-helper.service';
import { SearchDAO } from '../dao/search-dao';
import { SearchValueService } from '../search-value.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})


export class SearchComponent implements OnInit {

  searchResults: SearchDAO = {} as SearchDAO;
  filteredSearchResult:any|undefined;
  @Input() searchValue:string ='';
  errorMsg!:string;
  isLoading:boolean = false;
  searchForm: FormGroup;
  emptyInput:boolean = false;
  private subscription: Subscription;
  
  constructor(
    private formBuilder: FormBuilder,
    private backendHelper: BackendHelperService,
    private router: Router,
    private valueChangeService: SearchValueService
  ) {
    this.searchForm = this.formBuilder.group({searchValue:''});
    this.subscription = this.valueChangeService.getUpdate().subscribe( msg => {
      if(msg.text != 'home'){
        this.searchForm = this.formBuilder.group({searchValue: msg.text});
      }
    })
  }

  ngOnInit(): void {
    this.searchForm.get('searchValue')?.valueChanges.pipe(
      debounceTime(500),
      tap(()=>{
        this.errorMsg='';
        this.isLoading=true;
        this.searchResults={} as SearchDAO;
      }),
      switchMap((value) => (this.backendHelper.getSearch(value)
        .pipe(
          finalize(()=>{this.isLoading=false;})))) 
    ).subscribe((results:any) => {
      this.searchResults = results;
      this.filteredSearchResult = this.searchResults.result.filter( (res) => (
        res.type==='Common Stock'&&!res.displaySymbol.includes('.')
      ));
    });
  }

  onSubmit(form: any) {
    // console.log('searching symbol: ', form['searchValue']);
    if(form['searchValue'] == undefined || form['searchValue'] == '') {
      this.emptyInput = true;
    } 
    else {
      this.router.navigateByUrl('/search/'+form['searchValue'].toUpperCase());
      this.emptyInput = false;
    } 
  }

  clearInput() {
    this.searchForm.reset();
    this.valueChangeService.sendUpdate('home');
    this.router.navigateByUrl('/');
  }

  dismissAlert() {
    this.emptyInput = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
