import {
  BarChart,
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

const BinChart = ({
  data,
}: {
  data: {
    percent: string;
    price: number;
  }[];
}) => {
  // Calculate the min and max price values
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Format function to limit to four decimal places
  const formatPrice = (value: number) => value.toFixed(4);
  const isGreaterThanTargetPercent = (percent: string, target?: number): boolean => {
    // Remove the '%' symbol and parse the string to a number
    const value = parseFloat(percent.replace('%', ''));
    // Check if the value is greater than 1
    if (target) {
      return value > target;
    }
    return value > 1;
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis name="percent" dataKey="percent" />
        <YAxis domain={[minPrice, maxPrice]} tickFormatter={formatPrice} />
        <Tooltip formatter={formatPrice} />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
        <ReferenceLine y={0} stroke="#000" />
        <Bar dataKey="price" fill="#82ca9d">
          {data.map((entry, index) => {
            if (isGreaterThanTargetPercent(entry.percent, 1)) {
              return <Cell key={`cell-${index}`} fill={"#E57373"} />;
            }
            if (index >= data.length -4) {
              return <Cell key={`cell-${index}`} fill={"#FF9800"} />;
            }
            return <Cell key={`cell-${index}`} fill={"#82ca9d"} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BinChart;
