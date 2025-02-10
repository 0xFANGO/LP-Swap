import {
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import {
  EmptyState,
  HStack,
  PaginationPrevTrigger,
  VStack,
} from "@chakra-ui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "./components/ui/skeleton";
import { SortKey, useMeteOraStore } from "./store";
import { useFetchMeteora } from "./hooks/use-fetchMeteora";
import { useEffect, useState } from "react";
import React from "react";
import { PairInfo } from "./lib/utils/meteora";
import BigNumber from "bignumber.js";
import { formatNumber, parseCurrency } from "./lib/utils/meteora/money";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationRoot,
} from "./components/ui/pagination";
import SearchInput from "./components/SearchInput";
import { useNavigate } from "react-router";

interface Pool {
  id: string;
  name: string;
  poolCount: string;
  tvl: string;
  volume: string;
  feeRatio: string;
  poolPairs?: MeteoraPairs[];
}

interface MeteoraPairs {
  address: string;
  binStep: number;
  feeRatio: string;
  tvl: string;
  volume: string;
  name: string;
}

interface Props {
  className?: string;
}
export default function PoolDataTable({ className }: Props) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [tableData, setTableData] = useState<Pool[]>([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const pairLoading = useMeteOraStore((state) => state.pairLoading);
  const queryParams = useMeteOraStore((state) => state.queryParams);
  const { fetchMeteoraPools } = useFetchMeteora();
  const fetchAndFormatTableData = async () => {
    const metaData: {
      total: number;
      groups: {
        name: string;
        pairs: PairInfo[];
      }[];
    } = await fetchMeteoraPools(queryParams);
    const formatData: Pool[] = metaData?.groups.map((pool, index) => {
      const id = `${pool.name}_${index}`;
      const poolCount = `${pool.pairs?.length || 0} pools`;
      const tvl = pool.pairs?.reduce((acc, curr) => {
        return acc.plus(new BigNumber(curr.liquidity || "0"));
      }, new BigNumber(0));
      const volume24 = pool.pairs?.reduce((acc, curr) => {
        return acc.plus(new BigNumber(curr.trade_volume_24h || "0"));
      }, new BigNumber(0));
      const maxFeeRadio = pool.pairs?.reduce((acc, curr) => {
        return Math.max(acc, Number(curr.fee_tvl_ratio.hour_24));
      }, 0);
      return {
        id,
        name: pool.name,
        poolCount,
        tvl: formatNumber(tvl),
        volume: formatNumber(volume24),
        feeRatio: `${maxFeeRadio.toFixed(2)}%`,
        poolPairs: pool.pairs?.map((pair) => ({
          name: pair.name,
          binStep: pair.bin_step,
          address: pair.address,
          // feeRatio: pair.feeRatio,
          tvl: formatNumber(new BigNumber(pair.liquidity || "0")),
          volume: formatNumber(new BigNumber(pair.trade_volume_24h || "0")),
          feeRatio: `${formatNumber(
            new BigNumber(pair.fee_tvl_ratio.hour_24 || "0")
          )}%`,
        })),
      };
    });
    useMeteOraStore.setState({
      tableMetaData: metaData,
    });
    setTotal(metaData?.total || 0);
    setTableData(formatData);
    console.log("🚀 ~ formatData:", formatData);
  };
  useEffect(() => {
    fetchAndFormatTableData();
  }, [queryParams]);
  const [showAll, setShowAll] = useState(false);
  const toggleItem = (id: string) => {
    let newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems = new Set([id]);
    }
    setShowAll(false);
    setOpenItems(newOpenItems);
  };
  const getRecommendPairs = (pairs: MeteoraPairs[]) => {
    const sortKey = queryParams.sort_key;
    if (sortKey !== "feetvlratio") {
      return pairs
        .sort((a, b) => {
          return parseCurrency(b[sortKey]) - parseCurrency(a[sortKey]);
        })
        .slice(0, 3);
    }
    return pairs
      .sort((a, b) => {
        return parseCurrency(b.feeRatio) - parseCurrency(a.feeRatio);
      })
      .slice(0, 3);
  };
  const getShowPairs = (pairs: MeteoraPairs[]) => {
    if (showAll) {
      return pairs;
    }
    return getRecommendPairs(pairs);
  };
  const renderLoading = () => {
    return (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <TableRow key={index} className="border-0">
            <TableCell className="border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </TableCell>
            <TableCell className="border-0">
              <Skeleton className="h-4 w-24 mr-auto" />
            </TableCell>
            <TableCell className="border-0">
              <Skeleton className="h-4 w-28 mr-auto" />
            </TableCell>
            <TableCell className="border-0">
              <Skeleton className="h-4 w-16 mr-auto" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };
  const renderTableBody = () => {
    if (pairLoading) {
      return renderLoading();
    }
    if (tableData?.length) {
      return (
        <>
          {tableData.map((pool) => (
            <React.Fragment key={pool.id}>
              <TableRow
                className={cn(
                  "cursor-pointer hover:bg-gray-900 transition-colors border-0 py-4",
                  openItems.has(pool.id) && "bg-gray-900"
                )}
                onClick={() => toggleItem(pool.id)}
              >
                <TableCell className="font-base font-semibold border-0">
                  <div className="flex items-center gap-2">
                    {openItems.has(pool.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>{pool.name}</span>
                    <span className="ml-2 rounded-full bg-gray-800 px-2 py-1 text-xs">
                      {pool.poolCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-left border-0">{pool.tvl}</TableCell>
                <TableCell className="text-left border-0">
                  {pool.volume}
                </TableCell>
                <TableCell className="text-left border-0 pr-4">
                  {pool.feeRatio}
                </TableCell>
              </TableRow>

              {openItems.has(pool.id) && pool.poolPairs && (
                <>
                  {showAll ? null : (
                    <TableRow className="bg-[#101216] hover:bg-gray-800/50 text-sm cursor-pointer transition-colors border-0">
                      <TableCell
                        colSpan={24}
                        className="pl-8 font-semibold text-sm text-[#525269]"
                      >
                        Recommend Pools
                      </TableCell>
                    </TableRow>
                  )}
                  {getShowPairs(pool.poolPairs).map((pair, index) => (
                    <TableRow
                      key={index}
                      className="bg-[#101216] hover:bg-gray-800/50 text-sm cursor-pointer transition-colors border-0"
                      onClick={() => {
                        navigate(`/meteora/${pair.address}`);
                      }}
                    >
                      <TableCell className="border-0 w-[300px]">
                        <div className="flex items-center gap-2 pl-8">
                          <div>{pair.name}</div>
                          <div>
                            <span className="text-gray-400">Bin Step</span>{" "}
                            {pair.binStep}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-left border-0">
                        {pair.tvl}
                      </TableCell>
                      <TableCell className="text-left border-0">
                        {pair.volume}
                      </TableCell>
                      <TableCell className="text-left border-0 pr-4">
                        {pair.feeRatio}
                      </TableCell>
                    </TableRow>
                  ))}
                  {showAll ? (
                    <>
                      <TableRow
                        onClick={() => {
                          setShowAll(false);
                        }}
                        className="bg-[#101216] hover:bg-gray-800/50 text-sm cursor-pointer transition-colors border-0"
                      >
                        <TableCell
                          colSpan={24}
                          className="pl-8 font-semibold text-sm text-[#525269]"
                        >
                          <div className="flex items-center">
                            Show Less <ChevronUp />
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <>
                      <TableRow
                        onClick={() => {
                          setShowAll(true);
                        }}
                        className="bg-[#101216] hover:bg-gray-800/50 text-sm cursor-pointer transition-colors border-0"
                      >
                        <TableCell
                          colSpan={24}
                          className="pl-8 font-semibold text-sm text-[#525269] w-full"
                        >
                          <div className="mx-auto flex items-center">
                            Show All <ChevronDown />
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </>
      );
    }
    return (
      <TableRow className="border-0">
        <TableCell colSpan={24} className="pb-0 border-0">
          <EmptyState.Root size="lg">
            <EmptyState.Content>
              <EmptyState.Indicator>
                <Box />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No pools found</EmptyState.Title>
                <EmptyState.Description>
                  Try refreshing the page to see if any newly created pools have
                  been added to the list.
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        </TableCell>
      </TableRow>
    );
  };
  const handleSort = (key: SortKey) => {
    useMeteOraStore.setState({
      queryParams: {
        ...queryParams,
        sort_key: key,
      },
    });
  };
  return (
    <>
      <div className="flex w-full pl-2 items-center space-x-1 mt-6">
        <SearchInput
          value={queryParams.search_term || ""}
          placeholder="Search by token name, mint address or pool address..."
          onChange={(v) => {
            useMeteOraStore.setState({
              queryParams: {
                ...queryParams,
                search_term: v,
              },
            });
          }}
          isLoading={pairLoading}
          className="max-w-4xl"
          onSearch={fetchAndFormatTableData}
        />
      </div>
      <div className={cn("rounded-md bg-gray-950 text-white", className)}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-900 border-0">
              <TableHead className="w-[300px] border-0">Pool</TableHead>
              <TableHead className="text-left border-0">
                <div className="flex items-center">
                  <ChevronsUpDown
                    onClick={() => {
                      handleSort("tvl");
                    }}
                    className="h-4 w-4 cursor-pointer text-[#8585a1]"
                  />
                  TVL
                </div>
              </TableHead>
              <TableHead className="text-left border-0">
                <div className="flex items-center">
                  <ChevronsUpDown
                    onClick={() => {
                      handleSort("volume");
                    }}
                    className="h-4 w-4 text-[#8585a1] cursor-pointer"
                  />
                  24H Vol
                </div>
              </TableHead>
              <TableHead className="text-left border-0 pr-4">
                <div className="flex items-center">
                  <ChevronsUpDown
                    onClick={() => {
                      handleSort("feetvlratio");
                    }}
                    className="h-4 w-4 text-[#8585a1] cursor-pointer"
                  />
                  24H Fee/TVL
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>

        <PaginationRoot
          count={total}
          pageSize={10}
          variant="solid"
          page={queryParams.page + 1}
          className="flex justify-end"
          onPageChange={(e) => {
            useMeteOraStore.setState({
              queryParams: {
                ...queryParams,
                page: e.page - 1,
              },
            });
          }}
        >
          <HStack>
            <PaginationPrevTrigger>
              {tableData.length ? <ChevronLeft /> : null}
            </PaginationPrevTrigger>
            <PaginationItems />
            {tableData.length ? (
              <PaginationNextTrigger>
                <ChevronRight />
              </PaginationNextTrigger>
            ) : null}
          </HStack>
        </PaginationRoot>
      </div>
    </>
  );
}
