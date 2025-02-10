import { QueryParams, useMeteOraStore } from "@/store";
import { useToast } from "./use-toast";

export const useFetchMeteora = () => {
  // const pairLoading = useMeteOraStore((state) => state.pairLoading);
  const { toast } = useToast();
  const fetchMeteoraPools = async (query: QueryParams) => {
    try {
      useMeteOraStore.setState({
        pairLoading: true,
      });
      const url = new URL("https://app.meteora.ag/clmm-api/pair/all_by_groups");
      const params = new URLSearchParams(query as any);
      url.search = params.toString();

      const response = await fetch(url.toString());
      const data = await response.json();
      useMeteOraStore.setState({
        pairLoading: false,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error fetching Meteora pools" + error.message,
      });
      useMeteOraStore.setState({
        pairLoading: false,
      });
    }
  };
  return {
    fetchMeteoraPools,
  };
};
