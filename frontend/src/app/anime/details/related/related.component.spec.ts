import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeRelatedComponent } from './related.component';

describe('AnimeRelatedComponent', () => {
  let component: AnimeRelatedComponent;
  let fixture: ComponentFixture<AnimeRelatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimeRelatedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeRelatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
