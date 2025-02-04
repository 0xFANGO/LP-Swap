import { cn } from "@/lib/utils";
import React from "react";

interface DecimalInputProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
}

const DecimalInput: React.FC<DecimalInputProps> = ({
  value,
  onChange,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // 移除非数字和小数点的字符
    inputValue = inputValue.replace(/[^0-9.]/g, "");

    // 确保输入的值大于等于0
    if (parseFloat(inputValue) < 0) {
      inputValue = "";
    }

    // 限制最多六位小数
    if (inputValue.indexOf(".") !== -1) {
      const parts = inputValue.split(".");
      parts[1] = parts[1].slice(0, 6); // 只保留6位小数
      inputValue = parts.join(".");
    }

    // 调用外部传入的 onChange 函数来更新父组件的状态
    onChange(inputValue);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      className={cn(className)}
      placeholder="0.00"
    />
  );
};

export default DecimalInput;
