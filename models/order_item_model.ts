export interface OrderItemModel {
  statusCode?: number;
  data?: OrderItemData;
}

export interface OrderItemData {
  orderdetails?: Orderdetails;
  product?: Product;
  giftcard?: Giftcard;
  address?: Address;
}

export interface Address {
  addressid?: number;
  userid?: number;
  addressline?: string;
  landmark?: string;
  city?: string;
  district?: string;
  districtid?: number;
  state?: string;
  stateid?: number;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Giftcard {
  giftcardid?: number;
  giftcardimage?: string;
  giftcardname?: string;
  giftcardprice?: number;
  giftmessage?: string;
}

export interface Orderdetails {
  orderitemid?: number;
  orderid?: number;
  quantity?: number;
  price?: number;
  totalprice?: number;
  itemstatus?: string;
  ordertype?: string;
  gramsperday?: null;
  dayspermonth?: null;
  familymembers?: null;
}

export interface Product {
  productid?: number;
  bid?: number;
  productname?: string;
  productimage?: string;
}
