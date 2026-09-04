import { api } from "@/lib/axios";
import type {
  CreateWeighMeasurePayload,
  CreateWeighMeasureResponse,
  UploadWeighMeasureResultPayload,
  WeighMeasureHistoryResponse,
} from "@/types/weigh-measure";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useCreateWeighMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (payload: CreateWeighMeasurePayload) => {
      const { data } = await api.post<CreateWeighMeasureResponse>(
        "/weigh-measure",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["last-weigh-measure"] });
      void queryClient.invalidateQueries({
        queryKey: ["weigh-measure-progress"],
      });
      void queryClient.invalidateQueries({ queryKey: ["member-appointment"] });
      void queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
    },
  });
};

export const useUploadWeighMeasureResult = () =>
  useMutation({
    retry: false,
    mutationFn: async ({
      member_id,
      weigh_measure_id,
      photo,
    }: UploadWeighMeasureResultPayload) => {
      const formData = new FormData();
      formData.append("member_id", member_id);
      formData.append("weigh_measure_id", weigh_measure_id);
      formData.append("photo", photo as unknown as Blob);

      const { data } = await api.post("/upload/result-wm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });

interface MemberAppointmentPage<T = unknown> {
  response: T[] | null;
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
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const { data } = await api.get<WeighMeasureHistoryResponse>(
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
    mutationFn: async (club_id: string) => {
      const { data } = await api.get("/member-appointment", {
        params: { club_id },
      });
      return data;
    },
  });
};

export const useInfiniteMemberAppointments = ({
  club_id,
  key_tag_id,
  limit = 10,
}: {
  club_id?: string;
  key_tag_id?: string;
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["member-appointments", club_id, key_tag_id, limit],
    enabled: Boolean(club_id),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<MemberAppointmentPage>(
        "/member-appointment",
        {
          params: {
            club_id: club_id, //"6a1e8d9705824f405ed79f2c", //"6a1e906305824f405ed79f49",
            ...(key_tag_id ? { key_tag_id } : {}),
            offset: pageParam,
            limit,
          },
        },
      );
      if (data.response !== null && !Array.isArray(data.response)) {
        throw new Error("Format data appointment tidak sesuai.");
      }

      return {
        ...data,
        response: data.response ?? [],
        ...(data.response === null ? { total: 0 } : {}),
      };
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.response.length === 0) return undefined;

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
