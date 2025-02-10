import { Box, ChevronDown, ChevronRight } from "lucide-react";
import { EmptyState, VStack } from "@chakra-ui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Skeleton } from "./components/ui/skeleton";
import { useMeteOraStore } from "./store";
import { useFetchMeteora } from "./hooks/use-fetchMeteora";
import { useEffect, useState } from "react";
import React from "react";
import { PairInfo } from "./lib/utils/meteora";
import BigNumber from "bignumber.js";
import { formatNumber } from "./lib/utils/meteora/money";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";

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
          // feeRatio: pair.feeRatio,
          tvl: formatNumber(new BigNumber(pair.liquidity || "0")),
          volume: formatNumber(new BigNumber(pair.trade_volume_24h || "0")),
          feeRatio: `${formatNumber(
            new BigNumber(pair.fee_tvl_ratio.hour_24 || "0")
          )}%`,
        })),
      };
    });
    setTableData(formatData);
    console.log("🚀 ~ formatData:", formatData);
  };
  useEffect(() => {
    fetchAndFormatTableData();
  }, [queryParams]);
  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };
  const renderLoading = () => {
    return (
      <>
        {[1, 2, 3].map((index) => (
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
                  {pool.poolPairs.map((recommended, index) => (
                    <TableRow
                      key={index}
                      className="bg-[#101216] hover:bg-gray-800/50 text-sm cursor-pointer transition-colors border-0"
                    >
                      <TableCell className="border-0 w-[300px]">
                        <div className="flex items-center gap-2 pl-8">
                          <div>{recommended.name}</div>
                          <div>
                            <span className="text-gray-400">Bin Step</span>{" "}
                            {recommended.binStep}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-left border-0">
                        {recommended.tvl}
                      </TableCell>
                      <TableCell className="text-left border-0">
                        {recommended.volume}
                      </TableCell>
                      <TableCell className="text-left border-0 pr-4">
                        {recommended.feeRatio}
                      </TableCell>
                    </TableRow>
                  ))}
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
  return (
    <Tabs defaultValue="Meteora">
      <TabsList className={cn("w-40 flex items-center mt-2")}>
        <TabsTrigger value="Meteora" className="w-full flex items-center">
          {" "}
          <img src="/meteora.svg" className="w-6 h-6" />
          Meteora
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Meteora">
        <div className={cn("rounded-md bg-gray-950 text-white", className)}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-900 border-0">
                <TableHead className="w-[300px] border-0">Pool</TableHead>
                <TableHead className="text-left border-0">TVL</TableHead>
                <TableHead className="text-left border-0">24H Vol</TableHead>
                <TableHead className="text-left border-0 pr-4">
                  24H Fee/TVL
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>

          <Pagination className="justify-end pr-20">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>
    </Tabs>
  );
}
