import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickaddComponent } from './quickadd.component';

describe('QuickaddComponent', () => {
  let component: QuickaddComponent;
  let fixture: ComponentFixture<QuickaddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickaddComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
