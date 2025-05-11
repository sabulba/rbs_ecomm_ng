import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppOrderSummarySheetComponent } from './app-order-summary-sheet.component';

describe('AppOrderSummarySheetComponent', () => {
  let component: AppOrderSummarySheetComponent;
  let fixture: ComponentFixture<AppOrderSummarySheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppOrderSummarySheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppOrderSummarySheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
