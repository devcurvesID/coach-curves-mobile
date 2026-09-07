import { api } from "@/lib/axios";
import type { MemberFlag } from "@/helpers/member-flag-options";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface MemberByFlag {
  _id?: string;
  user_id?: string | null;
  source_id?: string | number;
  name?: string;
  photo?: string | null;
  key_tag_id?: string | number | null;
  user?: { _id?: string; name?: string };
}
interface MembersByFlagPage {
  members: MemberByFlag[];
  total?: number;
}

export interface MemberFlagResume {
  flag: MemberFlag["flag"];
  total: number;
}

const FLAGS: MemberFlag["flag"][] = ["A", "B", "C", "D", "E"];

type FlagResumeKey = `flag_${Lowercase<MemberFlag["flag"]>}`;

interface MemberFlagResumeResponse {
  response: Partial<Record<FlagResumeKey, number>> | null;
}

export const getMemberFlagClubId = (club: unknown): string | undefined => {
  if (typeof club === "string") return club.trim() || undefined;
  if (typeof club === "number" && Number.isFinite(club)) return String(club);
  if (club && typeof club === "object" && "_id" in club) {
    return getMemberFlagClubId(club._id);
  }
  return undefined;
};

export const useMemberFlagResume = (clubId?: string, enabled = true) =>
  useQuery<MemberFlagResume[]>({
    queryKey: ["member-flag-resume", clubId],
    enabled: Boolean(clubId) && enabled,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<MemberFlagResumeResponse>(
        `/members/flag-resume/${encodeURIComponent(clubId!)}`,
        { signal },
      );
      return FLAGS.map((flag) => ({
        flag,
        total:
          data.response?.[`flag_${flag.toLowerCase()}` as FlagResumeKey] ?? 0,
      }));
    },
  });

export const useMembersByFlag = (
  clubId: string | undefined,
  flag: MemberFlag["flag"],
  limit = 20,
) =>
  useInfiniteQuery({
    queryKey: ["members-by-flag", clubId, flag, limit],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<MembersByFlagPage> => {
      if (!clubId) throw new Error("Club user belum tersedia.");
      const { data } = await api.get(
        `/members/flag/${encodeURIComponent(clubId)}`,
        { params: { flag, offset: pageParam, limit }, signal },
      );
      const response = Array.isArray(data) ? data : data?.response;
      const rawTotal = data?.total ?? response?.total;
      const total =
        typeof rawTotal === "number" &&
        Number.isFinite(rawTotal) &&
        rawTotal >= 0
          ? rawTotal
          : undefined;
      if (response === null) return { members: [], total };
      const members = Array.isArray(response)
        ? response
        : (response?.data ?? response?.members ?? response?.results);
      if (!Array.isArray(members))
        throw new Error("Format data member tidak sesuai.");
      return { members, total };
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.members.length === 0) return undefined;
      const loaded = pages.reduce(
        (count, page) => count + page.members.length,
        0,
      );
      if (lastPage.total !== undefined)
        return loaded < lastPage.total ? loaded : undefined;
      return lastPage.members.length === limit ? loaded : undefined;
    },
  });
