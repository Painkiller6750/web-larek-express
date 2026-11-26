export interface IImage {
  fileName: string;
  originalName?: string;
  format?: string;
}

export interface IProduct {
  _id?: string;
  title: string;
  image: IImage;
  category: string;
  description?: string;
  price: number | null;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
}

export interface IOrder {
  items: string[];
  total: number;
}

export interface IOrderResult {
  id: string;
  total: number;
}
