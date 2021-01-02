import { TestBed } from '@angular/core/testing';

import { MangaService } from './manga.service';

describe('MangaService', () => {
  let service: MangaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MangaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
