import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadlistComponent } from './readlist.component';

describe('ReadlistComponent', () => {
  let component: ReadlistComponent;
  let fixture: ComponentFixture<ReadlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReadlistComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
