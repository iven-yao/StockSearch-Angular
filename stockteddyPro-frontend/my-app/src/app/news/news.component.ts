import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsDAO } from '../dao/news-dao';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  @Input() public news: NewsDAO = {} as NewsDAO;
  dateString: string = '';
  shareToFB: string = '';
  shareToTwitter: string = '';

  constructor(public newsModalService: NgbActiveModal) { }

  ngOnInit(): void {

    this.shareToFB = 'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent(this.news.url) +
      '&src=sdkpreparse';

    this.shareToTwitter = 'https://twitter.com/intent/tweet?text=' +
      encodeURIComponent(this.news.headline) +
      '&url=' +
      encodeURIComponent(this.news.url);    
      
    this.dateString = new Date(this.news.datetime*1000).toLocaleDateString('en-US',{month:'long', day:'2-digit', year:'numeric'});
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }

}
