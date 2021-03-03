import { TestBed } from '@angular/core/testing';

import { KitsuService } from './kitsu.service';

describe('KitsuService', () => {
  let service: KitsuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KitsuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
