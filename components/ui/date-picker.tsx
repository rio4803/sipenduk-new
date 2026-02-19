"use client"

import * as React from "react"
import { format, getDaysInMonth, getMonth, getYear, setMonth, setYear } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Import all locales from date-fns
import { enUS, id as idID } from "date-fns/locale"

// Dynamic import for locales
const locales: Record<string, any> = {
  en: enUS,
  id: idID,
}

// Dynamically import locales to avoid bundling all of them
const getLocale = async (localeCode: string) => {
  if (localeCode === "en") return enUS

  try {
    // Dynamic import based on locale code
    const module = await import(`date-fns/locale/${localeCode}/index.js`)
    return module.default
  } catch (error) {
    console.warn(`Locale ${localeCode} not found, falling back to Indonesian`)
    return idID
  }
}

interface DatePickerProps {
  id?: string
  selected?: Date | null
  onSelect?: (date: Date | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  error?: string
  name?: string
  fromYear?: number
  toYear?: number
  locale?: string
}

export function DatePicker({
  id,
  selected,
  onSelect,
  disabled = false,
  placeholder = "Pilih tanggal",
  className,
  error,
  name,
  fromYear = 1945,
  toYear = new Date().getFullYear(),
  locale = "id",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(selected || undefined)
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate ? getMonth(selectedDate) : getMonth(new Date()))
  const [currentYear, setCurrentYear] = React.useState(selectedDate ? getYear(selectedDate) : getYear(new Date()))
  const [open, setOpen] = React.useState(false)
  const [dateLocale, setDateLocale] = React.useState(idID)

  // Load the locale dynamically
  React.useEffect(() => {
    const loadLocale = async () => {
      const loadedLocale = await getLocale(locale)
      setDateLocale(loadedLocale)
    }

    loadLocale()
  }, [locale])

  // Get localized month names
  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1)
      return format(date, "MMMM", { locale: dateLocale })
    })
  }, [dateLocale])

  // Generate years array based on fromYear and toYear
  const years = React.useMemo(() => {
    return Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i)
  }, [fromYear, toYear])

  // Update the calendar when month or year changes
  React.useEffect(() => {
    if (selectedDate) {
      const newDate = setYear(setMonth(selectedDate, currentMonth), currentYear)
      setSelectedDate(newDate)
      if (onSelect) {
        onSelect(newDate)
      }
    }
  }, [currentMonth, currentYear])

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth))
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Generate calendar days
  const days = React.useMemo(() => {
    const daysList = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysList.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      daysList.push(new Date(currentYear, currentMonth, i))
    }

    return daysList
  }, [currentYear, currentMonth, firstDayOfMonth, daysInMonth])

  // Get localized weekday names
  const weekdays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      // Start with Sunday (i+2 because Jan 2, 2000 was a Sunday)
      const date = new Date(2000, 0, i + 2)
      return format(date, "EEEEE", { locale: dateLocale }) // Use narrow format for weekday names
    })
  }, [dateLocale])

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    if (onSelect) {
      onSelect(day)
    }
    setOpen(false)
  }

  const handleMonthChange = (value: string) => {
    const monthIndex = months.indexOf(value)
    if (monthIndex !== -1) {
      setCurrentMonth(monthIndex)
    }
  }

  const handleYearChange = (value: string) => {
    setCurrentYear(Number.parseInt(value))
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    if (onSelect) {
      onSelect(null)
    }
    setOpen(false)
  }

  // Get localized clear button text
  const getClearButtonText = () => {
    try {
      // This is a simple approach - in a real app, you might want to use a proper i18n library
      const clearTexts: Record<string, string> = {
        en: "Clear",
        id: "Hapus",
        es: "Borrar",
        fr: "Effacer",
        de: "Löschen",
        it: "Cancella",
        pt: "Limpar",
        ru: "Очистить",
        zh: "清除",
        ja: "クリア",
        ko: "지우기",
      }

      return clearTexts[locale] || "Clear"
    } catch (error) {
      return "Clear"
    }
  }

  return (
    <div className="">
      {id && <Label htmlFor={id} style={{display: "none"}}>{placeholder}</Label>}
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-destructive",
              className,
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP", { locale: dateLocale }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
        >
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <div className="flex items-center justify-center space-x-2 flex-1 mx-1">
                <Select value={months[currentMonth]} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-8 min-w-[120px] text-xs">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month} className="text-sm">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="h-8 min-w-[70px] text-xs">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-sm">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs leading-6 text-muted-foreground">
              {weekdays.map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
              {days.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="h-8 w-8" />
                }

                const isSelected =
                  selectedDate &&
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear()

                const isToday =
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear()

                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      isSelected && "text-primary-foreground",
                      isToday && !isSelected && "border-primary text-primary",
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {day.getDate()}
                  </Button>
                )
              })}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                {getClearButtonText()}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

