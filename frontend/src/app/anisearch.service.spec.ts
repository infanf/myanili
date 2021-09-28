import { TestBed } from '@angular/core/testing';

import { AnisearchService } from './anisearch.service';

describe('AnisearchService', () => {
  let service: AnisearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnisearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
