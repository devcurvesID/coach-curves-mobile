import { getMemberFlagStyle } from "@/helpers/member-flag";
export interface MemberFlag {
  flag: "A" | "B" | "C" | "D" | "E";
}
export const MEMBER_FLAG_OPTIONS = (["A", "B", "C", "D", "E"] as const).map(
  (flag) => ({
    flag,
    ...getMemberFlagStyle(flag),
    description: `Daftar member dengan status flag ${flag}`,
  }),
);
