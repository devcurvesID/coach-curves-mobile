export interface MemberFlag {
  flag: "A" | "B" | "C" | "D" | "E";
  color: string;
  backgroundColor: string;
}

export const MONTHLY_WORKOUT_TARGET = 12;

export const getMemberFlagStyle = (
  flag?: string | null,
): Pick<MemberFlag, "color" | "backgroundColor"> => {
  switch (flag?.toUpperCase()) {
    case "A":
      return { color: "#22C55E", backgroundColor: "#DCFCE7" };
    case "B":
      return { color: "#84CC16", backgroundColor: "#ECFCCB" };
    case "C":
      return { color: "#EAB308", backgroundColor: "#FEF9C3" };
    case "D":
      return { color: "#F97316", backgroundColor: "#FFEDD5" };
    case "E":
    case "F":
      return { color: "#EF4444", backgroundColor: "#FEE2E2" };
    default:
      return { color: "#6F3FA0", backgroundColor: "#F3E8FF" };
  }
};

export const getMemberFlag = (workoutCount: number): MemberFlag => {
  if (workoutCount >= MONTHLY_WORKOUT_TARGET) {
    return { flag: "A", color: "#22C55E", backgroundColor: "#DCFCE7" };
  }
  if (workoutCount >= 8) {
    return { flag: "B", color: "#84CC16", backgroundColor: "#ECFCCB" };
  }
  if (workoutCount >= 4) {
    return { flag: "C", color: "#EAB308", backgroundColor: "#FEF9C3" };
  }
  if (workoutCount >= 1) {
    return { flag: "D", color: "#F97316", backgroundColor: "#FFEDD5" };
  }

  return { flag: "E", color: "#EF4444", backgroundColor: "#FEE2E2" };
};
