import { TestBed } from '@angular/core/testing';

import { AnilistService } from './anilist.service';

describe('AnilistService', () => {
  let service: AnilistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnilistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
