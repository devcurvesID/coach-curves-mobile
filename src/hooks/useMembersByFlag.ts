import { api } from "@/lib/axios";
import type { MemberFlag } from "@/helpers/member-flag-options";
import { useInfiniteQuery } from "@tanstack/react-query";

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
