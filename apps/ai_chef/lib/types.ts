export type OrderItem = {
  dishName: string;
  quantity: number;
  image?: string;
};

export type Order = {
  _id: string;
  orderId?: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
};

export type MenuItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  available?: boolean;
};

export type CartItem = {
  dishId: string;
  dishName?: string;
  category?: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Cart = {
  sessionId: string;
  items: CartItem[];
};

export type Toast = {
  msg: string;
  type: "success" | "error";
};
