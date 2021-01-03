import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MalIconComponent } from './mal.component';

describe('MalIconComponent', () => {
  let component: MalIconComponent;
  let fixture: ComponentFixture<MalIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MalIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MalIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
