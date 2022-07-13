import { Component, OnInit } from '@angular/core';
import { SearchValueService } from '../search-value.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {

  searchDest:string = 'home';

  constructor(
    private valueChangeService: SearchValueService
  ) { 
    this.valueChangeService.getUpdate().subscribe(
      msg => {
        this.searchDest = msg.text
      }
    );
  }

  ngOnInit(): void {
  }

}
