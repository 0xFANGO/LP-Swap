"use client"

import { Search, ArrowRight, Loader } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react";
import { useState } from "react"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  isLoading?: boolean
}

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  isLoading = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div
      className={`
        flex items-center w-full max-w-2xl rounded-full border 
        transition-shadow duration-200
        ${isFocused ? "shadow-md" : "hover:shadow-sm"}
      `}
    >
      <div className="pl-4">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-3"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full mr-1 text-[#ff8861] hover:bg-transparent hover:text-[#ff6b3b]"
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Loader className="h-5 w-5" />
          </motion.div>
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}

