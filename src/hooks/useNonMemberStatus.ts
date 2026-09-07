import { api } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export type NonMemberStatus = "Inactive" | "Stopped";
export interface NonMember {
  name: string;
  club_id: number | string;
  phone?: string | number | null;
  photo?: string | null;
  status: NonMemberStatus;
  from_date?: string | null;
  thru_date?: string | null;
  user_id: number | string;
}

export function getNonMemberClubId(club: unknown): string | undefined {
  if (typeof club === "string") return club.trim() || undefined;
  if (typeof club === "number" && Number.isFinite(club)) return String(club);
  if (club && typeof club === "object" && "_id" in club)
    return getNonMemberClubId(club._id);
  return undefined;
}

export function useNonMemberStatus(
  clubId: string | undefined,
  status: NonMemberStatus,
  year: number,
  name: string,
  limit = 20,
) {
  return useInfiniteQuery({
    queryKey: ["nonmemberstatus", clubId, status, year, name, limit],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<{ members: NonMember[]; total?: number }> => {
      if (!clubId) throw new Error("Club pengguna belum tersedia.");
      const { data } = await api.get(`/nonmemberstatus/club/${encodeURIComponent(clubId)}`, {
        params: { status, year, ...(name ? { name } : {}), offset: pageParam, limit },
        signal,
      });
      const response = Array.isArray(data) ? data : data?.response ?? data;
      const members = Array.isArray(response)
        ? response
        : response?.data ?? response?.members ?? response?.results;
      if (!Array.isArray(members)) {
        if (data?.response === null) return { members: [] };
        throw new Error("Format data member tidak sesuai.");
      }
      const rawTotal = data?.total ?? response?.total;
      const total = rawTotal != null && Number.isFinite(Number(rawTotal)) && Number(rawTotal) >= 0
        ? Number(rawTotal) : undefined;
      return { members, total };
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.members.length) return undefined;
      const previousIds = new Set(pages.slice(0, -1).flatMap(page => page.members.map(member => String(member.user_id))));
      if (lastPage.members.every(member => previousIds.has(String(member.user_id)))) return undefined;
      const loaded = pages.reduce((count, page) => count + page.members.length, 0);
      return lastPage.total !== undefined
        ? loaded < lastPage.total ? loaded : undefined
        : lastPage.members.length === limit ? loaded : undefined;
    },
  });
}
