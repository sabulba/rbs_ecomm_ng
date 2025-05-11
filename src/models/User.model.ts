export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  cellular: string;
  role?: 'admin' | 'user';
  accountNumber?: string;
  status?: string;

}
