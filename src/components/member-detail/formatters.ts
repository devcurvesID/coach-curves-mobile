export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const displayValue = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "Belum tersedia";
  return String(value).trim() || "Belum tersedia";
};

export const getTshirtSize = (size?: number | null): string => {
  const sizes: Record<number, string> = {
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
  };

  return size ? (sizes[size] ?? "-") : "-";
};
