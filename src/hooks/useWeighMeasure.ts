import { api } from "@/lib/axios";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

interface MemberAppointmentPage<T = unknown> {
  response: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

export const useLastWeighMeasure = () => {
  return useQuery({
    queryKey: ["last-weigh-measure"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/last-weigh-measure");
      return response;
    },
  });
};

export const useWeighMeasureHistory = () => {
  return useMutation({
    mutationFn: async ({ year, month }: any) => {
      const { data } = await api.get(
        `/user/weigh-measure?year=${year}&month=${month}`,
      );
      return data;
    },
  });
};

export const useWeighMeasurePrintout = () => {
  return useMutation({
    mutationFn: async (query?: string) => {
      let url = "/user/weigh-measure-printout";
      if (query) {
        url = `${url}${query}`;
      }
      const { data } = await api.get(url);
      return data.response;
    },
  });
};

export const useWeighMeasureProgress = () => {
  return useQuery({
    queryKey: ["weigh-measure-progress"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/weigh-measure-progress");
      return response;
    },
  });
};

export const useWeighMeasureProgressByUserId = () => {
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data } = await api.get(`/weigh-measure/user-progress/${user_id}`);
      return data.response;
    },
  });
};

export const useWeighMeasureHistoryByUserId = () => {
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data } = await api.get(`/weigh-measure?user_id=${user_id}`);
      return data.response;
    },
  });
};

export const useMemberAppointmentByStaffId = () => {
  return useMutation({
    mutationFn: async (staff_id: string) => {
      const { data } = await api.get("/member-appointment", {
        params: { staff_id },
      });
      return data;
    },
  });
};

export const useInfiniteMemberAppointments = ({
  staffId,
  limit = 10,
}: {
  staffId?: string;
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["member-appointments", staffId, limit],
    enabled: Boolean(staffId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<MemberAppointmentPage>(
        "/member-appointment",
        {
          params: {
            staff_id: "6a1e8d9705824f405ed79f2c", //"6a1e906305824f405ed79f49",
            offset: pageParam,
            limit,
          },
        },
      );
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce(
        (total, page) => total + page.response.length,
        0,
      );
      if (lastPage.total !== undefined) {
        return loadedCount < lastPage.total ? loadedCount : undefined;
      }
      return lastPage.response.length === limit ? loadedCount : undefined;
    },
  });
};

export const useMemberAppointmentByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["member-appointment", "user", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await api.get(
        `/member-appointment?user_id=${encodeURIComponent(userId ?? "")}`,
      );
      return data.response ?? null;
    },
  });
};
