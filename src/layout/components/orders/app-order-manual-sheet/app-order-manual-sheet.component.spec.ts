import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppOrderManualSheetComponent } from './app-order-manual-sheet.component';

describe('AppOrderManualSheetComponent', () => {
  let component: AppOrderManualSheetComponent;
  let fixture: ComponentFixture<AppOrderManualSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppOrderManualSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppOrderManualSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
