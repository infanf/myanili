import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaRecommendationsComponent } from './recommendations.component';

describe('MangaRecommendationsComponent', () => {
  let component: MangaRecommendationsComponent;
  let fixture: ComponentFixture<MangaRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangaRecommendationsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MangaRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
