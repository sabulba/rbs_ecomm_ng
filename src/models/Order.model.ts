
export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  cartItems: {
    title: string;
    name: string;
    cartQuantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed';
  date: Date;
}
