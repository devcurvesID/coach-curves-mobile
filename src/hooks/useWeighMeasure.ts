import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

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
