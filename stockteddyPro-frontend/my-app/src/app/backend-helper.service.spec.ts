import { inject, TestBed } from '@angular/core/testing';

import { BackendHelperService } from './backend-helper.service';

describe('BackendHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendHelperService]
    });
  });

  it('should ...', inject([BackendHelperService], (service: BackendHelperService) => {
    expect(service).toBeTruthy();
  }));
});
