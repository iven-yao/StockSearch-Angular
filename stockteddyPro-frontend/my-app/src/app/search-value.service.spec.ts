import { TestBed } from '@angular/core/testing';

import { SearchValueService } from './search-value.service';

describe('SearchValueService', () => {
  let service: SearchValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
