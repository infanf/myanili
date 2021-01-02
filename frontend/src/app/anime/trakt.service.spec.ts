import { TestBed } from '@angular/core/testing';

import { TraktService } from './trakt.service';

describe('TraktService', () => {
  let service: TraktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TraktService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
