/// Orders List Model
export interface OrdersModel {
  statusCode?: number;
  data?: OrdersData[];
}

export interface OrdersData {
  orderid?: number;
  userid?: number;
  addressid?: number;
  bid?: number;
  totalamount?: number;
  ordertype?: string;
  itemtype?: string;
  orderstatus?: string;
  paymentstatus?: string;
  paymentid?: null;
  items?: ProductsItems[];
}

export interface ProductsItems {
  productid?: number;
  productname?: string;
  productimage?: string;
}

/// Order Details Model
export interface OrderDetailModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  order?: Order;
  items?: Item[];
}

export interface Item {
  orderitemid?: number;
  orderid?: number;
  userid?: number;
  quantity?: number;
  price?: number;
  totalprice?: number;
  itemstatus?: string;
  ordertype?: string;
  gramsperday?: null;
  dayspermonth?: null;
  familymembers?: null;
  quantitypersonkg?: null;
  totalquantitykg?: null;
  calculatedprice?: null;
  product?: Product;
  giftcard?: Giftcard;
  address?: Address;
}

export interface Address {
  addressid?: number;
  addressline?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface Product {
  productid?: number;
  bid?: number;
  productname?: string;
  productimage?: string;
  price?: number;
  sellingprice?: number;
  itemtype?: string;
}

export interface Order {
  orderid?: number;
  totalamount?: number;
  orderstatus?: string;
  paymentstatus?: string;
  ordertype?: string;
  address?: string;
}

export interface Giftcard {
    giftcardid?: number;
    cardname?:   string;
    giftmessage?:   string;
    cardimage?:  string;
    cardprice?:  number;
}
