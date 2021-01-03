import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraktIconComponent } from './trakt.component';

describe('TraktComponent', () => {
  let component: TraktIconComponent;
  let fixture: ComponentFixture<TraktIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TraktIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraktIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
