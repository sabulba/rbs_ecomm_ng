import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/auth/auth.service';
import { NgxBottomSheetService } from 'ngx-bottom-sheet';
import {BottomMenuComponent} from "./bottom-menu/bottom-menu.component";
import {filter, map, Observable, startWith} from "rxjs";


@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule],
})
export class HeaderComponent implements OnInit {
  user: any = '';
  displayName: string = '';
  isLoggedIn: boolean = false;
  activeMenu: string = '';
  pageName$: Observable<string | null>;

  private pageNameMap: { [path: string]: string } = {
    '/register': 'הרשמה',
    '/login': 'התחברות',
    '/': 'תפריט',
    '/admin/products': 'מוצרים',
    '/admin/users': 'משתמשים',
    '/admin/accounts': 'חשבונות',
    '/admin/orders': 'הזמנות',
    '/orders': 'הזמנות',
    '/cart': 'סל קניות',
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    private bottomSheetService: NgxBottomSheetService
  ) {
    this.pageName$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith({
        url: this.router.url,
        urlAfterRedirects: this.router.url,
        id: 0, // dummy value
      } as NavigationEnd),
      map((event) => {
        const path = event.urlAfterRedirects.split('?')[0];
        return this.pageNameMap[path] || null;
      })
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = user !== null && user !== undefined;
      this.displayName = user?.firstName && user?.lastName ? 'הי , ' + user?.firstName + ' ' + user?.lastName : '';
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }

  openMenu() {
    this.bottomSheetService.open(BottomMenuComponent, {
      height: '40vh',

    });
  }

  logOut() {
    this.authService.logout();
  }


  setActive(menu: string) {
    this.activeMenu = menu;
  }
}
