import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectorSheetComponent } from './date-selector-sheet.component';

describe('DateSelectorSheetComponent', () => {
  let component: DateSelectorSheetComponent;
  let fixture: ComponentFixture<DateSelectorSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateSelectorSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateSelectorSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
