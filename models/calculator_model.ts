export interface CalculatorOrderModel {
  statusCode?: number;
  data?: Datum[];
}

export interface Datum {
  orderid?: number;
  userid?: number;
  addressid?: number;
  totalamount?: number;
  ordertype?: string;
  orderstatus?: string;
  paymentstatus?: string;
  paymentid?: null;
  orderdate?: string;
}

// monthly cart model

export interface MonthlyCartModel {
  statusCode?: number;
  data?: MonthlyCartData;
}

export interface MonthlyCartData {
  items?: MonthlyCartItem[];
  totalamount?: number;
}

export interface MonthlyCartItem {
  monthlycartid?: number;
  bid?: number;
  userid?: number;
  productid?: number;
  productname?: string;
  productimage?: string;
  gramsperday?: number;
  dayspermonth?: number;
  familymembers?: number;
  quantitypersonkg?: number;
  totalquantitykg?: number;
  sellingprice?: number;
  price?: number;
  calcultedprice?: number;
  itemtype?: string;
}

// calc order detail
export interface CalculatorOrderDetailModel {
  statusCode?: number;
  data?: CalculatorData;
}

export interface CalculatorData {
  order?: CalculatorOrder;
  items?: CalculatorOrderItem[];
}

export interface CalculatorOrderItem {
  orderitemid?: number;
  orderid?: number;
  productid?: number;
  productname?: string;
  productimage?: string;
  itemtype?: string;
  price?: number;
  quantitypersonkg?: number;
  totalquantitykg?: number;
  totalprice?: number;
  gramsperday?: number;
  dayspermonth?: number;
  familymembers?: number;
}

export interface CalculatorOrder {
  totalamount?: number;
  orderstatus?: string;
  paymentstatus?: string;
  address?: string;
}
