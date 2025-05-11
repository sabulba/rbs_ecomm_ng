import { Component } from '@angular/core';
import {OrdersComponent} from "../../../../layout/components/orders/orders/orders.component";
import {FabMenuComponent} from "../../../../layout/components/fab-menu/fab-menu.component";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    OrdersComponent,
    FabMenuComponent,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent {

}
