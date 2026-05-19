export interface ResponseModel {
  statusCode?: number;
  data?: string;
}

export interface VerifyOTPModel {
  statusCode?: number;
  data?: Data;
}

export interface Data {
  userid?: number;
  role?: string;
  token?: string;
}

export interface ProfileModel {
  statusCode?: number;
  data?: ProfileData;
}

export interface ProfileData {
  userid?: number;
  profileimage?: null;
  email?: string;
  username?: string;
  phone?: string;
}
