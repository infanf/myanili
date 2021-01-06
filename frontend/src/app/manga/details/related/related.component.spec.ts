import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaRelatedComponent } from './related.component';

describe('MangaRelatedComponent', () => {
  let component: MangaRelatedComponent;
  let fixture: ComponentFixture<RelatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangaRelatedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
