import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
  selector: 'app-button-renderer',
  standalone: true,
  imports: [],
  templateUrl: './button-renderer.component.html',
  styleUrl: './button-renderer.component.css'
})
export class ButtonRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  onClick() {
    alert('Button clicked in row: ' + this.params.node.rowIndex);
  }

  refresh(params: any): boolean {
    return true;
  }
}
