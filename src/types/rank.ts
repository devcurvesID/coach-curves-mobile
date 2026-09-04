export interface RankClub {
  _id: string;
  club_name: string;
}

export interface RankUser {
  _id: string;
  source_id: number;
  name: string;
  email: string;
}

export interface MemberRank {
  _id: string;
  weigh_diff: string;
  size_diff: string;
  body_fat_diff: string;
  wo_count: number;
  user_id: string;
  club_id: string;
  wm_date?: string;
  created_at: string;
  updated_at: string;
  club: RankClub;
  user: RankUser;
}

export interface MemberRankPage {
  response: MemberRank[];
}
