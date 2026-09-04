export interface MemberDetail {
  _id?: string;
  user_id: string;
  user: {
    name: string;
    email?: string | null;
  };
  photo?: string | null;
  flag?: string | null;
  birth?: string | null;
  joined?: string | null;
  phone?: string | number | null;
  cellphone?: string | number | null;
  address?: string | null;
  postal?: string | number | null;
  key_tag_id?: string | null;
  tshirt_size?: number | null;
}

export interface MemberAppointment {
  _id?: string;
  app_date: string;
  app_hour?: string | null;
  status?: boolean | string | null;
}

export type MeasurementValue = string | number | null;

export interface WeighMeasureRecord {
  wm_date: string;
  weight?: MeasurementValue;
  body_fat?: MeasurementValue;
  bmi?: MeasurementValue;
  total_measurement?: MeasurementValue;
}

export interface WeighMeasureProgress {
  current?: WeighMeasureRecord | null;
  previous?: WeighMeasureRecord | null;
}
