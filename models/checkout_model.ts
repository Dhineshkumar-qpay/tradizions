export interface CheckoutDetailModel {
  statusCode?: number;
  data?: CheckoutData;
}

export interface CheckoutData {
  products?: CheckoutProduct[];
  totalamount?: number;
}

export interface CheckoutProduct {
  cartid?: number;
  itemtype?: string;
  quantity?: number;
  totalprice?: number;
  productid?: number;
  giftid?: number;
  giftcardid?: number;
  name?: string;
  image?: string;
  price?: number;
  sellingprice?: number;
  categoryname?: string;
  giftcard?: GiftCard | null;
}

export interface GiftCard {
  giftcardid?: number;
  bid?: number;
  cardname?: string;
  cardprice?: number;
  cardimage?: string;
  status?: string;
}

export interface OrderModel {
  statusCode?: number;
  data?: OrdersData[];
}

export interface OrdersData {
  orderitemid?: number;
  orderid?: number;
  bid?: number;
  userid?: number;
  productid?: number;
  quantity?: number;
  price?: string;
  giftcardid?: number;
  giftmessage?: null | string;
  giftcardprice?: string;
  totalprice?: string;
  itemstatus?: string;
  productname?: string;
  productimage?: string;
  categoryname?: string;
}
