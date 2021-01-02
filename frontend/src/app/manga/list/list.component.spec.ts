import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaListComponent } from './list.component';

describe('MangaListComponent', () => {
  let component: MangaListComponent;
  let fixture: ComponentFixture<MangaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangaListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MangaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
