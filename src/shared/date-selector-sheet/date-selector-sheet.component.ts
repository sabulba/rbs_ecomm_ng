import { Component } from '@angular/core';
import {FirebaseService} from "../firebase/firebase.service";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {DatePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-date-selector-sheet',
  standalone: true,
  imports: [
    DatePipe,
    MatButton,
    FormsModule
  ],
  templateUrl: './date-selector-sheet.component.html',
  styleUrl: './date-selector-sheet.component.css'
})
export class DateSelectorSheetComponent {
  selectedDate:any;
  constructor( private bottomSheetRef: MatBottomSheetRef<DateSelectorSheetComponent>) {}
  confirmOrder() {
    this.bottomSheetRef.dismiss({selectedDate:this.selectedDate});
  }

  cancelOrder() {
    this.bottomSheetRef.dismiss('canceled');
  }
}
