import { api } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface MemberHasntWorkout {
  user_id: number | string;
  name?: string | null;
  club_id: number | string;
  joined?: string | null;
  phone?: string | number | null;
  photo?: string | null;
}

interface MemberHasntWorkoutPage {
  members: MemberHasntWorkout[];
  total?: number;
}

interface MemberHasntWorkoutResponse {
  response?: MemberHasntWorkout[] | null;
  data?: MemberHasntWorkout[] | null;
  total?: number | string;
}

export const getHasntWorkoutClubId = (club: unknown): string | undefined => {
  if (typeof club === "string") return club.trim() || undefined;
  if (typeof club === "number" && Number.isFinite(club)) return String(club);
  if (club && typeof club === "object" && "_id" in club) {
    return getHasntWorkoutClubId(club._id);
  }
  return undefined;
};

export const useMembersHasntWorkout = ({
  clubId,
  name,
  limit = 10,
}: {
  clubId?: string;
  name?: string;
  limit?: number;
}) =>
  useInfiniteQuery<MemberHasntWorkoutPage>({
    queryKey: ["members-hasnt-workout", clubId, name, limit],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      if (!clubId) throw new Error("Club pengguna belum tersedia.");

      const { data } = await api.get<
        MemberHasntWorkoutResponse | MemberHasntWorkout[]
      >(`/member-hasnt-workout/club/${encodeURIComponent(clubId)}`, {
        params: {
          ...(name ? { name } : {}),
          offset: pageParam,
          limit,
        },
        signal,
      });
      const members = Array.isArray(data)
        ? data
        : Array.isArray(data.response)
          ? data.response
          : Array.isArray(data.data)
            ? data.data
            : data.response === null || data.data === null
              ? []
              : undefined;

      if (!members) throw new Error("Format data member tidak sesuai.");

      const rawTotal = Array.isArray(data) ? undefined : data.total;
      const parsedTotal = Number(rawTotal);
      return {
        members,
        total:
          rawTotal !== undefined && Number.isFinite(parsedTotal)
            ? parsedTotal
            : undefined,
      };
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.members.length) return undefined;
      const previousIds = new Set(
        pages
          .slice(0, -1)
          .flatMap((page) =>
            page.members.map((member) => String(member.user_id)),
          ),
      );
      if (
        lastPage.members.every((member) =>
          previousIds.has(String(member.user_id)),
        )
      ) {
        return undefined;
      }

      const loaded = pages.reduce(
        (total, page) => total + page.members.length,
        0,
      );
      if (lastPage.total !== undefined) {
        return loaded < lastPage.total ? loaded : undefined;
      }
      return lastPage.members.length === limit ? loaded : undefined;
    },
  });
