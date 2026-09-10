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
  total_wo?: number | null;
  club?: { _id?: string; club_name?: string } | null;
  user?: { _id?: string; name?: string };
}
interface MembersByFlagPage {
  members: MemberByFlag[];
  total?: number;
}

export interface MembersGroupedByFlag {
  flag: MemberFlag["flag"];
  total: number;
  members: MemberByFlag[];
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

export const fetchMemberFlagResume = async (
  clubId: string,
  signal?: AbortSignal,
): Promise<MemberFlagResume[]> => {
  const { data } = await api.get<MemberFlagResumeResponse>(
    `/members/flag-resume/${encodeURIComponent(clubId)}`,
    { signal },
  );
  return FLAGS.map((flag) => ({
    flag,
    total: data.response?.[`flag_${flag.toLowerCase()}` as FlagResumeKey] ?? 0,
  }));
};

const fetchMembersByFlagPage = async ({
  clubId,
  flag,
  offset,
  limit,
  signal,
}: {
  clubId: string;
  flag: MemberFlag["flag"];
  offset: number;
  limit: number;
  signal?: AbortSignal;
}): Promise<MembersByFlagPage> => {
  const { data } = await api.get(
    `/members/flag/${encodeURIComponent(clubId)}`,
    { params: { flag, offset, limit }, signal },
  );
  const response = Array.isArray(data) ? data : data?.response;
  const rawTotal = data?.total ?? response?.total;
  const parsedTotal = Number(rawTotal);
  const total =
    rawTotal !== undefined && Number.isFinite(parsedTotal) && parsedTotal >= 0
      ? parsedTotal
      : undefined;
  if (response === null) return { members: [], total };
  const members = Array.isArray(response)
    ? response
    : (response?.data ?? response?.members ?? response?.results);
  if (!Array.isArray(members)) {
    throw new Error("Format data member tidak sesuai.");
  }
  return { members, total };
};

export const fetchAllMembersGroupedByFlag = async (
  clubId: string,
  resume: MemberFlagResume[],
): Promise<MembersGroupedByFlag[]> => {
  const limit = 100;

  return Promise.all(
    FLAGS.map(async (flag) => {
      const total = resume.find((item) => item.flag === flag)?.total ?? 0;
      const members: MemberByFlag[] = [];
      const memberIds = new Set<string>();
      let offset = 0;

      while (members.length < total) {
        const page = await fetchMembersByFlagPage({
          clubId,
          flag,
          offset,
          limit,
        });
        const newMembers = page.members.filter((member, index) => {
          const memberId = String(
            member._id ??
              member.user_id ??
              member.user?._id ??
              member.source_id ??
              `${offset}-${index}`,
          );
          if (memberIds.has(memberId)) return false;
          memberIds.add(memberId);
          return true;
        });
        members.push(...newMembers);
        offset += page.members.length;

        if (
          page.members.length === 0 ||
          newMembers.length === 0 ||
          page.members.length < limit ||
          members.length >= total
        ) {
          break;
        }
      }

      return { flag, total, members: members.slice(0, total) };
    }),
  );
};

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
    queryFn: ({ signal }) => fetchMemberFlagResume(clubId!, signal),
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
      return fetchMembersByFlagPage({
        clubId,
        flag,
        offset: Number(pageParam),
        limit,
        signal,
      });
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
