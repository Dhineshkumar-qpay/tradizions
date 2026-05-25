export interface HomeProductModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  gifthampers?: Featured[];
  poojahampers?: Featured[];
}

export interface Featured {
  productid?: number;
  bid?: number;
  productimage?: string;
  productname?: string;
  categoryid?: number;
  availablestock?: number;
  subcategoryid?: number;
  price?: number;
  sellingprice?: number;
}

export interface ReviewModel {
  statusCode?: number;
  data?: Review[];
}

export interface Review {
  reviewid?: number;
  userid?: number;
  username?: string;
  rating?: number;
  email?: string;
  review?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KuralModel {
  statusCode?: number;
  data?: KuralData[];
}

export interface KuralData {
  kuralid?: number;
  kural?: string;
  meaning?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CalculatorProductsModel {
    statusCode?: number;
    data?:       CalculatorProducts[];
}

export interface CalculatorProducts {
    bid?:          number;
    productid?:    number;
    productname?:  string;
    productimage?:  string;
    categoryid?:   number;
    price?:        number;
    sellingprice?: number;
    weight?:       number;
    unit?:         string;
}
