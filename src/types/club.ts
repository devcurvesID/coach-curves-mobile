export interface Club {
  _id: string;
  club_name: string;
  club_code: string;
  city: string;
  province: string;
  address: string;
  status: string;
  phones?: string | number;
  photo?: string;
}

export interface CoachPersonal {
  photo?: string | null;
  phone?: string | number | null;
}

export interface CoachUser {
  _id?: string;
  name?: string | null;
  email?: string | null;
  user_personal?: CoachPersonal | null;
}

export interface ClubCoach {
  _id: string;
  user_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | number | null;
  photo?: string | null;
  status?: string | null;
  user?: CoachUser | null;
  user_personal?: CoachPersonal | null;
}
