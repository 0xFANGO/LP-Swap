import * as React from "react";
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

interface Pool {
  id: string;
  name: string;
  poolCount: string;
  tvl: string;
  volume: string;
  feeRatio: string;
  recommendedPools?: RecommendedPool[];
}

interface RecommendedPool {
  binStep: number;
  fee: string;
  tvl: string;
  volume: string;
  feeRatio: string;
  name: string;
}

const data: Pool[] = [
  {
    id: "1",
    name: "SOL-USDC",
    poolCount: "75 pools",
    tvl: "$40,136,932.14",
    volume: "$124,208,545.00",
    feeRatio: "0.03%",
    recommendedPools: [
      {
        name: "SOL-USDC",
        binStep: 10,
        fee: "0.02%",
        tvl: "$2,759,985.70",
        volume: "$42,508,332.00",
        feeRatio: "< 0.01%",
      },
      {
        name: "SOL-USDC",
        binStep: 10,
        fee: "0.10%",
        tvl: "$9,825,949.14",
        volume: "$35,821,420.00",
        feeRatio: "0.01%",
      },
      {
        name: "SOL-USDC",
        binStep: 20,
        fee: "0.20%",
        tvl: "$11,592,978.70",
        volume: "$9,105,107.00",
        feeRatio: "< 0.01%",
      },
    ],
  },
  {
    id: "2",
    name: "TRUMP-USDC",
    poolCount: "54 pools",
    tvl: "$444,558,711.88",
    volume: "$76,364,012.00",
    feeRatio: "0.03%",
  },
];

interface Props {
  className?: string;
}
export default function PoolDataTable({ className }: Props) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

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
                  Fee/TVL
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? (
                <>
                  {data.map((pool) => (
                    <React.Fragment key={pool.id}>
                      <TableRow
                        className={cn(
                          "cursor-pointer hover:bg-gray-900 transition-colors border-0",
                          openItems.has(pool.id) && "bg-gray-900"
                        )}
                        onClick={() => toggleItem(pool.id)}
                      >
                        <TableCell className="font-medium border-0">
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
                        <TableCell className="text-left border-0">
                          {pool.tvl}
                        </TableCell>
                        <TableCell className="text-left border-0">
                          {pool.volume}
                        </TableCell>
                        <TableCell className="text-left border-0 pr-4">
                          {pool.feeRatio}
                        </TableCell>
                      </TableRow>
                      {openItems.has(pool.id) && pool.recommendedPools && (
                        <>
                          {pool.recommendedPools.map((recommended, index) => (
                            <TableRow
                              key={index}
                              className="bg-[#101216] hover:bg-gray-800/50 transition-colors border-0"
                            >
                              <TableCell className="border-0">
                                <div className="flex items-center gap-2 pl-8">
                                  <div>{recommended.name}</div>
                                  <div>
                                    <span className="text-gray-400">
                                      Bin Step
                                    </span>{" "}
                                    {recommended.binStep}
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Fee</span>{" "}
                                    {recommended.fee}
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
              ) : (
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
                            Try refreshing the page to see if any newly created
                            pools have been added to the list.
                          </EmptyState.Description>
                        </VStack>
                      </EmptyState.Content>
                    </EmptyState.Root>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
