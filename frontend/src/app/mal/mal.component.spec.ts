import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MalComponent } from './mal.component';

describe('MalComponent', () => {
  let component: MalComponent;
  let fixture: ComponentFixture<MalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
