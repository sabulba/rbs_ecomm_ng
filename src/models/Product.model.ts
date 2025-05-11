
export interface Product {
    id:number;
    title?:string;
    desc?: string;
    category?: string;
    type?: string;
    sizes?: string[];
    size?:string;
    images?: string[];
    stock?: string;
    price?: number;
    prevprice?:number;
    qty?:number;
    discount?:number;
    totalprice?:number;
    rating?: {
      rate?: number;
      count?: number;
    }
    date?: Date;
    brand?: string;
    imageUrl?: string;
}


