import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraktComponent } from './trakt.component';

describe('TraktComponent', () => {
  let component: TraktComponent;
  let fixture: ComponentFixture<TraktComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TraktComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraktComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
