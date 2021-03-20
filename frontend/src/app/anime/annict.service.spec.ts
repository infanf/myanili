import { TestBed } from '@angular/core/testing';

import { AnnictService } from './annict.service';

describe('AnnictService', () => {
  let service: AnnictService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnictService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
