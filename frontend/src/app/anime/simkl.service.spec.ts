import { TestBed } from '@angular/core/testing';

import { SimklService } from './simkl.service';

describe('SimklService', () => {
  let service: SimklService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimklService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
