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

