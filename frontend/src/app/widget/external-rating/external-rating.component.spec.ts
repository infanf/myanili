import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRatingComponent } from './external-rating.component';

describe('ExternalRatingComponent', () => {
  let component: ExternalRatingComponent;
  let fixture: ComponentFixture<ExternalRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalRatingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
