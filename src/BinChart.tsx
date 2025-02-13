import { useMemo } from "react";
import {
  ComposedChart,
  // Line,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const BARS_ONLY_FOR_SHOW = 4;

const BinChart = ({
  data,
  onBarClick,
}: {
  data: {
    percent: string;
    price: number;
  }[];
  onBarClick: (data: any) => void;
}) => {
  const formatData = useMemo(() => {
    // 计算Liquidity
    const liqudityNum = data.length - BARS_ONLY_FOR_SHOW; // 除去最后几个区间，均提供流动性
    return data.map((d, index) => {
      if (index >= data.length - BARS_ONLY_FOR_SHOW) {
        return {
          ...d,
          liquidity: 0,
        };
      }
      return {
        ...d,
        liquidity: 1 / liqudityNum,
      };
    });
  }, [data]);
  // Calculate the min and max liquidity
  const liquidities = formatData.map((d) => d.liquidity);
  const minLiquidity = Math.min(...liquidities);
  const maxLiquidity = Math.max(...liquidities);
  // const prices = formatData.map((d) => d.price);
  // const minPrice = Math.min(...prices);
  // const maxPrice = Math.max(...prices);

  // Format function to limit to four decimal places
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const isGreaterThanTargetPercent = (
    percent: string,
    target?: number
  ): boolean => {
    // Remove the '%' symbol and parse the string to a number
    const value = parseFloat(percent.replace("%", ""));
    // Check if the value is greater than 1
    if (target) {
      return value > target;
    }
    return value > 1;
  };

  // Function to downsample data
  // const downsampleData = (
  //   data: { percent: string; price: number, liquidity: number }[],
  //   maxPoints: number
  // ) => {
  //   const factor = Math.ceil(data.length / maxPoints);
  //   return data.filter((_, index) => index % factor === 0);
  // };

  // // Downsample data to a maximum of 100 points
  // const maxPoints = 10;
  // const downsampledData = downsampleData(formatData, maxPoints);

  return (
    <>
      <p>
        <div className="flex items-center text-xs">
          <div className="w-4 h-2 bg-[#82ca9d] mr-2"></div>
          recommended range
          <div className="flex items-center ml-2">
            <div className="w-4 h-2 bg-[#E57373] mr-2"></div>
            range increase exceeds 1%.
          </div>
        </div>
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={500}
          height={300}
          data={formatData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            name="percent"
            dataKey="percent"
            label={{
              value: "Price Increase",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          <YAxis
            domain={[minLiquidity, maxLiquidity]}
            tickFormatter={formatPercent}
            label={{
              value: "Liquidity",
              position: "insideTopLeft",
              offset: -21,
            }}
          />
          <Tooltip formatter={formatPercent} />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="liquidity" fill="#82ca9d">
            {formatData.map((entry, index) => {
              if (isGreaterThanTargetPercent(entry.percent, 1)) {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={"#E57373"}
                    onClick={() => {
                      onBarClick({ ...entry, index });
                    }}
                  />
                );
              }
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={"#82ca9d"}
                  onClick={() => {
                    onBarClick({ ...entry, index });
                  }}
                />
              );
            })}
          </Bar>
          {/* <Line type="monotone" dataKey="price" stroke="#82ca9d" /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export default BinChart;
