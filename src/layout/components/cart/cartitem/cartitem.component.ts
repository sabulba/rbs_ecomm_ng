import { Component, Input } from '@angular/core';
import {Product} from "../../../../models";
import {CartService} from "../../../../shared/cart/cart.service";
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-cartitem',
  templateUrl: './cartitem.component.html',
  imports:[CommonModule],
  styles: [
  ]
})
export class CartItemComponent {
  img='https://firebasestorage.googleapis.com/v0/b/ecomm-store-22.appspot.com/o/assets%2Fimages%2F29.jpg?alt=media&token=aef10446-375d-493b-b2d5-5a8c64548346'
  @Input() item!:any;
  constructor(private cartService:CartService){}

  removeFromCart(product:Product){
    this.cartService.remove(product);
    this.cartService.getTotal();
  }

  addQty(product:Product){
    this.cartService.addQty(product);
    this.cartService.getTotal();
  }
  lessQty(product:Product){
    const qty = product.qty ?? 1;
    if (qty <= 1) {
      this.removeFromCart(product);
    } else {
      this.cartService.lessQty(product);
      this.cartService.getTotal();
    }
  }
}
