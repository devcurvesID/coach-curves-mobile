export interface Publicity {
  _id?: string;
  id: string | number;
  headline: string;
  note: string;
  photo?: string;
  from_date: string;
  thru_date: string;
  status: string;
  challenge?: string;
  type?: string;
}

export interface PartnerPromo {
  id: string | number;
  cp_name: string;
  pic_name: string;
  address: string;
  phone_number: string;
  email: string;
  status: "active" | "inactive";
  message: string;
  from_date: string;
  thru_date: string;
}

export interface ApiResponse<T> {
  response: T;
}
