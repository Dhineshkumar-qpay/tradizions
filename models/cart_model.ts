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
  productid?: number;
  totalprice?: number;
  giftcardid?: number;
  giftmessage?: string;
  giftid?: number;
  productname?: string;
  productimage?: string;
  price?: number;
  sellingprice?: number;
  categoryname?: string;
  giftcard?: Giftcard[];
  products?: CustomGiftProduct[];
  giftpackid?: number;
  giftpackimage?: string;
  giftpackname?: string;
  giftpackprice?: number;
}

export interface CustomGiftProduct {
  customgiftitemid?: number;
  giftpackid?: number;
  productid?: number;
  productname?: string;
  productimage?: string;
  quantity?: number;
  sellingprice?: number;
  itemtype?: string;
  totalprice?: number;
  userid?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
