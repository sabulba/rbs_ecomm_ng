import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MatButton } from "@angular/material/button";

@Component({
  standalone: true,
  selector: 'app-order-summary-sheet',
  templateUrl: './app-order-summary-sheet.component.html',
  styleUrls: ['./app-order-summary-sheet.component.css'],
  imports: [CommonModule, CurrencyPipe, MatButton]
})
export class OrderSummarySheetComponent {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any ,
              private bottomSheetRef: MatBottomSheetRef<OrderSummarySheetComponent>,
              private bottomSheet: MatBottomSheet) {}

  cancel(): void {
    this.bottomSheetRef.dismiss('canceled');
  }

  confirm(): void {
    this.bottomSheetRef.dismiss('confirmed');
  }
}
