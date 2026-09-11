export interface MembershipType {
  membership_type_name: string;
}

export interface MemberStatus {
  status: string;
  from_date: string;
  thru_date: string;
  last_wm: string;
  membership_type?: MembershipType | null;
}

export interface MemberHold {
  member_hold_note?: string | null;
  member_hold_reason_id: string | number;
}
