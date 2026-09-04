export type MeasurementKey =
  | "weight"
  | "body_fat"
  | "muscle_mass"
  | "bone_mass"
  | "bmi"
  | "bp_high"
  | "bp_low"
  | "rhr"
  | "dci"
  | "metabolic"
  | "body_water"
  | "visceral"
  | "chest"
  | "waist"
  | "abdomen"
  | "hip"
  | "thigh"
  | "arm";

export type CreateWeighMeasurePayload = Record<MeasurementKey, number> & {
  user_id: string;
  pro_workout: "Yes" | "No";
  three_times_a_week: "Yes" | "No";
  recommendation: string | null;
};

export interface CreatedWeighMeasure {
  _id: string;
  user_id: string;
}

export interface CreateWeighMeasureResponse {
  _id?: string;
  user_id?: string;
  response?: CreatedWeighMeasure | null;
}

export interface UploadWeighMeasureResultPayload {
  member_id: string;
  weigh_measure_id: string;
  photo: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface WeighMeasureRecord {
  _id: string;
  wm_date: string;
  created_at: string;
  age?: number | string | null;
  height?: number | string | null;
  weight?: number | string | null;
  bmi?: number | string | null;
  body_fat?: number | string | null;
  muscle_mass?: number | string | null;
  bone_mass?: number | string | null;
  body_water?: number | string | null;
  visceral?: number | string | null;
  bp_high?: number | string | null;
  bp_low?: number | string | null;
  rhr?: number | string | null;
  chest?: number | string | null;
  waist?: number | string | null;
  abdomen?: number | string | null;
  hip?: number | string | null;
  thigh?: number | string | null;
  arm?: number | string | null;
}

export interface WeighMeasureHistoryResponse {
  response: WeighMeasureRecord[];
  total?: number;
}
