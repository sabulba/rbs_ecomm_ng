import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-fab-menu',
  standalone: true,
  imports: [CommonModule ,  RouterModule],
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.css']
})
export class FabMenuComponent {
  menuOpen = false;
  constructor(private router:Router){}
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  action(actionName: string) {
    this.menuOpen = false;
    switch (actionName) {
      case 'orders':
        this.router.navigate(['/admin/orders']);
        break;
      case 'products':
        this.router.navigate(['/admin/products']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'accounts':
        this.router.navigate(['/admin/accounts']);
        break;
      default:
        this.router.navigate(['/admin/orders']);
    }

  }
}
