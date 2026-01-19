// src/components/ui/multi-select.tsx
'use client';

import * as React from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandInput,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface MultiSelectProps {
  options: {
    label: string;
    value: string;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      placeholder = '선택하세요',
      className,
      disabled = false,
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    React.useEffect(() => {
      setSelectedValues(defaultValue);
    }, [defaultValue]);

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onValueChange([]);
    };

    // 화면에 표시될 텍스트 결정 (말줄임표 적용)
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;
      
      const selectedLabels = selectedValues
        .map(val => options.find(o => o.value === val)?.label)
        .filter(Boolean);

      if (selectedLabels.length <= 1) return selectedLabels[0];
      return `${selectedLabels[0]} 외 ${selectedLabels.length - 1}건`;
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className={cn(
              'flex w-full h-10 items-center justify-between px-3 py-2 rounded-lg border bg-white transition-all hover:bg-slate-50',
              selectedValues.length > 0 ? 'border-indigo-200 text-slate-900 font-semibold' : 'border-slate-200 text-slate-400 font-medium',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
              className
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="truncate text-xs">{getDisplayText()}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {selectedValues.length > 0 && (
                <div 
                  className="p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3 text-slate-400" />
                </div>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 text-slate-400 transition-transform duration-200",
                isPopoverOpen && "rotate-180"
              )} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 border-slate-200 shadow-2xl rounded-xl overflow-hidden mt-1" 
          align="start"
        >
          <Command className="w-full">
            <CommandInput placeholder="검색..." className="h-10 border-none focus:ring-0 text-xs" />
            <CommandList className="max-h-[280px] overflow-y-auto custom-scrollbar">
              <CommandEmpty className="py-6 text-center text-xs text-slate-400 font-medium">검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className={cn(
                        "flex items-center gap-2.5 py-2 px-3 mb-0.5 rounded-lg cursor-pointer text-xs font-medium transition-all",
                        isSelected ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        className={cn(
                          "h-4 w-4 rounded border-slate-300 transition-colors",
                          isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="ml-auto h-3 w-3 text-indigo-600" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
