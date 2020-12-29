import { TestBed } from '@angular/core/testing';

import { MalService } from './mal.service';

describe('MalService', () => {
  let service: MalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
