export interface ProductDetailModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  productdetail?: Productdetail;
  reviews?: Review[];
  avgrating?: string;
  totalreviews?: number;
}

export interface Productdetail {
  productid?: number;
  bid?: number;
  productimage?: string;
  productname?: string;
  categoryid?: number;
  categoryname?: string;
  subcategoryid?: number;
  subcategoryname?: string;
  brandname?: string;
  description?: string;
  price?: number;
  sellingprice?: number;
  weight?: number;
  unit?: string;
  availablestock?: number;
  isFeatured?: boolean;
  isFavourite?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  ingredients?: string;
  shelflife?: string;
  storageinfo?: string;
  calories?: number;
  protien?: number;
  fibre?: number;
  fat?: number;
  carbohydrates?: number;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  isfavourite?: boolean;
}

export interface Review {
  reviewid?: number;
  productid?: number;
  rating?: number;
  review?: string;
  name?: string;
  title?: string;
  createdAt?: string;
  userid?: number;
}

export interface GiftDetailModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  giftdetail?: Giftdetail;
  reviews?: Review[];
  avgrating?: string;
  totalreviews?: number;
}

export interface Giftdetail {
  giftid?: number;
  bid?: number;
  giftname?: string;
  giftimage?: string;
  categoryid?: number;
  categoryname?: string;
  subcategoryid?: number;
  subcategoryname?: string;
  isFavourite?: boolean;
  giftdescription?: string;
  productlist?: Productlist[];
  giftprice?: number;
  giftsellingprice?: number;
  stock?: number;
  discount?: number;
  weight?: number;
  unit?: string;
  packingtype?: string;
  image1?: null;
  image2?: null;
  image3?: null;
  image4?: null;
}

export interface Productlist {
  name?: string;
}

export interface GiftCardsModel {
  statusCode?: number;
  data?: GiftCardsData[];
}

export interface GiftCardsData {
  giftcardid?: number;
  bid?: number;
  cardname?: string;
  cardprice?: number;
  cardimage?: string;
  status?: string;
}

export interface HealthGoalsModel {
  statusCode?: number;
  data?: HealthGoalsData[];
}

export interface HealthGoalsData {
  goalid?: number;
  goalimage?: string;
  goalname?: string;
  description?: string;
}
