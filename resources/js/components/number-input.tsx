"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value" | "defaultValue"> {
    value?: number
    defaultValue?: number
    onChange?: (value: number | undefined) => void
    min?: number
    max?: number
    step?: number
    formatOptions?: Intl.NumberFormatOptions
    locale?: string
    allowEmpty?: boolean
    controls?: boolean
    className?: string
    inputClassName?: string
    buttonClassName?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            value,
            defaultValue,
            onChange,
            min,
            max,
            step = 1,
            formatOptions,
            locale,
            allowEmpty = true,
            controls = true,
            className,
            inputClassName,
            buttonClassName,
            disabled,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState<number | undefined>(() => {
            if (value !== undefined) return value
            if (defaultValue !== undefined) return defaultValue
            return undefined
        })

        const isControlled = value !== undefined
        const currentValue = isControlled ? value : internalValue

        const formatter = React.useMemo(() => {
            return new Intl.NumberFormat(locale, formatOptions)
        }, [locale, formatOptions])

        const updateValue = React.useCallback(
            (newValue: number | undefined) => {
                if (!isControlled) {
                    setInternalValue(newValue)
                }
                onChange?.(newValue)
            },
            [isControlled, onChange]
        )

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value

            if (inputValue === "" && allowEmpty) {
                updateValue(undefined)
                return
            }

            // Improved number parsing to handle localized formats
            const cleanValue = inputValue.replace(/[^\d.-]/g, "")
            const parsed = Number.parseFloat(cleanValue)

            if (!isNaN(parsed)) {
                const clampedValue = clamp(parsed, min, max)
                updateValue(clampedValue)
            }
        }

        const handleIncrement = () => {
            if (disabled) return

            const newValue = currentValue !== undefined ? currentValue + step : step
            const clampedValue = clamp(newValue, min, max)
            updateValue(clampedValue)
        }

        const handleDecrement = () => {
            if (disabled) return

            const newValue = currentValue !== undefined ? currentValue - step : -step
            const clampedValue = clamp(newValue, min, max)
            updateValue(clampedValue)
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled) return

            if (e.key === "ArrowUp") {
                e.preventDefault()
                handleIncrement()
            } else if (e.key === "ArrowDown") {
                e.preventDefault()
                handleDecrement()
            }
        }

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            props.onBlur?.(e)

            if (currentValue !== undefined) {
                const clampedValue = clamp(currentValue, min, max)
                if (clampedValue !== currentValue) {
                    updateValue(clampedValue)
                }
            }
        }

        const displayValue = currentValue !== undefined ? formatter.format(currentValue) : ""

        return (
            <div className={cn("relative w-full !p-0 m-0 border-none", className)}>
                <input
                    {...props}
                    ref={ref}
                    type="text"
                    inputMode="decimal"
                    value={displayValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={cn(
                        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        controls && "pr-10",
                        inputClassName
                    )}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue}
                    aria-valuetext={displayValue}
                    role="spinbutton"
                />
                {controls && (
                    <div className="absolute right-0 top-0 flex h-full flex-col border-l">
                        <Button
                            type="button"
                            variant={"outline"}
                            tabIndex={-1}
                            disabled={disabled || (max !== undefined && currentValue !== undefined && currentValue >= max)}
                            onClick={handleIncrement}
                            className={cn(
                                "flex h-1/2 w-10 rounded-l-none rounded-br-none border-0",
                                buttonClassName
                            )}
                            aria-label="Increment"
                        >
                            <ChevronUp className="h-4 w-4 opacity-50" />
                        </Button>
                        <Button
                            type="button"
                            variant={"outline"}
                            tabIndex={-1}
                            disabled={disabled || (min !== undefined && currentValue !== undefined && currentValue <= min)}
                            onClick={handleDecrement}
                            className={cn(
                                "flex h-1/2 w-10 rounded-l-none rounded-tr-none border-0",
                                buttonClassName
                            )}
                            aria-label="Decrement"
                        >
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </div>
                )}
            </div>
        )
    }
)

NumberInput.displayName = "NumberInput"

function clamp(value: number, min?: number, max?: number): number {
    if (min !== undefined && value < min) return min
    if (max !== undefined && value > max) return max
    return value
}

export { NumberInput }
