import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaCharactersComponent } from './characters.component';

describe('MangaCharactersComponent', () => {
  let component: MangaCharactersComponent;
  let fixture: ComponentFixture<MangaCharactersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangaCharactersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MangaCharactersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
