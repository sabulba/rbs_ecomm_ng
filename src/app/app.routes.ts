import { Routes } from '@angular/router';
import {LoginComponent} from "../pages/login/login.component";
import {RegisterComponent} from "../pages/register/register.component";
import {CartComponent} from "../layout/components/cart/cart.component";
import {HomeComponent} from "../pages/home/home.component";
import {OrdersComponent} from "../layout/components/orders/orders/orders.component";
import {AdminOrdersComponent} from "../pages/admin/orders/admin-orders/admin-orders.component";
import {AdminProductsComponent} from "../pages/admin/orders/admin-products/admin-products.component";
import {AdminUsersComponent} from "../pages/admin/orders/admin-users/admin-users.component";
import {AdminAccountsComponent} from "../pages/admin/orders/admin-accounts/admin-accounts.component";

export const routes: Routes = [
  {
    path:'login',
    component:LoginComponent,
    // canActivate:[canActivate]

  },
  {
    path:'',
    component:HomeComponent,
  },
  {
    path:'register',
    component:RegisterComponent,
    // canActivate:[canActivate]

  },
  {
    path:'cart',
    component:CartComponent,
    // canActivate:[canActivate]

  },
  {
    path:'orders',
    component:OrdersComponent,
    // canActivate:[canActivate]

  },
  {
    path:'admin/orders',
    component:AdminOrdersComponent,
    // canActivate:[canActivate]

  },
  {
    path:'admin/products',
    component:AdminProductsComponent,
    // canActivate:[canActivate]
  },
  {
    path:'admin/users',
    component:AdminUsersComponent,
    // canActivate:[canActivate]
  },
  {
    path:'admin/accounts',
    component:AdminAccountsComponent,
    // canActivate:[canActivate]
  },
];
