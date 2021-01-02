import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeDetailsComponent } from './details.component';

describe('AnimeDetailsComponent', () => {
  let component: AnimeDetailsComponent;
  let fixture: ComponentFixture<AnimeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimeDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
