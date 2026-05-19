export interface CheckoutDetailModel {
  statusCode?: number;
  data?: CheckoutDetailData;
}

export interface CheckoutDetailData {
  products?: Product[];
  totalamount?: number;
}

export interface Product {
  cartid?: number;
  itemtype?: string;
  quantity?: number;
  totalprice?: number;
  productid?: number;
  name?: string;
  image?: string;
  price?: number;
  sellingprice?: number;
  categoryname?: string;
  giftcardid?: number;
  giftid?: number;
  giftcard?: Giftcard | null;
}

export interface Giftcard {
  giftcardid?: number;
  bid?: number;
  cardname?: string;
  cardprice?: number;
  cardimage?: string;
  status?: string;
}
