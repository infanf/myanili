import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSeasonComponent } from './widget-season.component';

describe('WidgetSeasonComponent', () => {
  let component: WidgetSeasonComponent;
  let fixture: ComponentFixture<WidgetSeasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WidgetSeasonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
