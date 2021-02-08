import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeListGridComponent } from './grid.component';

describe(' AnimeListGridComponent', () => {
  let component: AnimeListGridComponent;
  let fixture: ComponentFixture<AnimeListGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimeListGridComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeListGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
