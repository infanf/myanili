import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnisearchComponent } from './anisearch.component';

describe('AnisearchComponent', () => {
  let component: AnisearchComponent;
  let fixture: ComponentFixture<AnisearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnisearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnisearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
