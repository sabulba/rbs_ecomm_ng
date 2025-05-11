import { Component } from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import { NgxBottomSheetService  } from 'ngx-bottom-sheet';
@Component({
  selector: 'app-bottom-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-menu.component.html',
  styleUrl: './bottom-menu.component.css'
})
export class BottomMenuComponent {
  constructor(private bottomSheetService: NgxBottomSheetService) {}
  close() {
    this.bottomSheetService.close();
  }
}
