import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeSongsComponent } from './songs.component';

describe('AnimeSongsComponent', () => {
  let component: AnimeSongsComponent;
  let fixture: ComponentFixture<AnimeSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimeSongsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
