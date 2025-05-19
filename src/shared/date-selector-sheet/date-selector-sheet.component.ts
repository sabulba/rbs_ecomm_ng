import {Component} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
@Component({
  selector: 'app-date-selector-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
  ],
  templateUrl: './date-selector-sheet.component.html',
  styleUrl: './date-selector-sheet.component.css'
})
export class DateSelectorSheetComponent {
  selectedDate: string;

  constructor(private bottomSheetRef: MatBottomSheetRef<DateSelectorSheetComponent>) {
    const now = new Date();
    this.selectedDate = now.toISOString().slice(0, 7);
  }

  confirmOrder() {
    const selectedDate = new Date(this.selectedDate + '-01');
    this.bottomSheetRef.dismiss({ selectedDate: selectedDate });
  }
  cancelOrder() {
    this.bottomSheetRef.dismiss('canceled');
  }

  // chosenMonthHandler(normalizedMonth: Date, datepicker: any) {
  //   this.selectedDate = new Date(normalizedMonth.getFullYear(), normalizedMonth.getMonth(), 1);
  //   datepicker.close();
  // }
}
