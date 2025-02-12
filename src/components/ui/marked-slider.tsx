"use client"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ProgressMark {
  position: number // 0-100
  label: string
}

interface MarkedSliderProps {
  value: number
  onChange?: (value: number) => void
  marks?: ProgressMark[]
  className?: string
}

export function MarkedSlider({ value = 0, onChange, marks = [], className }: MarkedSliderProps) {
  return (
    <Card className={cn("p-8 w-full max-w-2xl", className)}>
      <div className="space-y-10">
        <div className="relative">
          {/* Marks and labels */}
          <div className="absolute -top-8 left-0 right-0">
            {marks.map((mark, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 transition-opacity"
                style={{
                  left: `${mark.position}%`,
                  opacity: Math.abs(value - mark.position) < 10 ? 1 : 0.6,
                }}
              >
                <div className="text-sm font-medium text-center whitespace-nowrap mb-2 transition-colors">
                  {mark.label}
                </div>
                <div
                  className={cn(
                    "w-0.5 h-4 mx-auto transition-all",
                    Math.abs(value - mark.position) < 2 ? "bg-primary h-6" : "bg-muted-foreground/50",
                  )}
                />
              </div>
            ))}
          </div>

          {/* Slider */}
          <Slider
            value={[value]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => onChange?.(value[0])}
            className="pt-2"
          />
        </div>

        {/* Current value display */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Progress</h4>
            <p className="text-sm text-muted-foreground">Drag the slider to adjust progress</p>
          </div>
          <div className="text-2xl font-bold tabular-nums">{value}%</div>
        </div>
      </div>
    </Card>
  )
}

