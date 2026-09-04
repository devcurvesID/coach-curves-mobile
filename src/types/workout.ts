export interface WorkoutClub {
  _id?: string;
  club_name: string;
}

export interface WorkoutRecord {
  _id: string;
  workout_date: string;
  created_at: string;
  club?: WorkoutClub | null;
}

export interface WorkoutHistoryParams {
  year: number;
  month: number;
}

export interface WorkoutByUserParams {
  user_id: string;
  offset: number;
  limit: number;
}

export interface WorkoutHistorySummary {
  total: number;
  total_workout_per_month: number;
}

export interface WorkoutHistoryResponse extends WorkoutHistorySummary {
  response: WorkoutRecord[];
}
