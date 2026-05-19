export interface ShopProductModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  totalProducts?: number;
  totalPages?: number;
  currentPage?: number;
  products?: Product[];
}

export interface Product {
  productid?: number;
  bid?: number;
  productimage?: string;
  productname?: string;
  categoryid?: number;
  categoryname?: string;
  subcategoryid?: number;
  subcategoryname?: string;
  brandname?: null | string;
  description?: string;
  price?: number;
  sellingprice?: number;
  weight?: number | null;
  unit?: string;
  availablestock?: number;
  isFeatured?: boolean;
  isFavourite?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  ingredients?: null | string;
  shelflife?: null | string;
  storageinfo?: null | string;
  calories?: number;
  protien?: number;
  fibre?: number;
  fat?: number;
  carbohydrates?: number;
  country?: string;
  productlist?: null | string;
  packingtype?: null | string;
  itemtype?: string;
  gifttype?: string;
}
