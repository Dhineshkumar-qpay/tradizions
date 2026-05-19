export interface CartModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  cart?: Cart[];
  totalamount?: number;
}

export interface Cart {
  cartid?: number;
  itemtype?: string;
  quantity?: number;
  totalprice?: number;
  giftcardid?: number;
  giftmessage?: string;
  giftid?: number;
  name?: string;
  image?: string;
  price?: number;
  sellingprice?: number;
  categoryname?: string;
  giftcard?: Giftcard[];
  productid?: number;
}

export interface Giftcard {
  giftcardid?: number;
  bid?: number;
  cardname?: string;
  cardprice?: number;
  cardimage?: string;
  status?: string;
}

export interface FavouriteProductModel {
  statusCode?: number;
  data?: FavouriteProduct[];
}

export interface FavouriteProduct {
  favouriteid?: number;
  productid?: number;
  productname?: string;
  productimage?: string;
  price?: number;
  sellingprice?: number;
}
