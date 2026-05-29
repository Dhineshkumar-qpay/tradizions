export interface DistrictModel {
  statusCode?: number;
  data?: Districts[];
}

export interface Districts {
  districtid?: number;
  district?: string;
  stateid?: number;
}

export interface StateModel {
  statusCode?: number;
  data?: States[];
}

export interface States {
  stateid?: number;
  state?: string;
}

export interface AddressModel {
  statusCode?: number;
  data?: AddressData[];
}

export interface AddressData {
  addressid?: number;
  userid?: number;
  addressline?: string;
  landmark?: string;
  email?: string;
  city?: string;
  district?: string;
  districtid?: number;
  state?: string;
  stateid?: number;
  country?: string;
  pincode?: string;
  title?: string;
  fullname?: string;
  mobilenumber?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
