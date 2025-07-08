'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BrainCircuit } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: {
    projectType: string;
    causeMain: string;
    projectCost: [number, number];
  };
  onFilterChange: (filters: any) => void;
  projectTypes: string[];
  causes: string[];
  maxCost: number;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  projectTypes,
  causes,
  maxCost,
}: FilterSidebarProps) {
  const pathname = usePathname();
  const handleSliderChange = (value: number[]) => {
    onFilterChange({ ...filters, projectCost: value });
  };

  const handleReset = () => {
    onFilterChange({
      projectType: 'all',
      causeMain: 'all',
      projectCost: [0, maxCost],
    });
  };

  const formatCost = (cost: number) => {
    if (cost >= 100000000) return `${(cost / 100000000).toFixed(1)}억`;
    if (cost >= 10000) return `${Math.round(cost / 10000)}만`;
    return cost;
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <Image src="https://placehold.co/200x50" alt="SMART Construction" width={180} height={40} data-ai-hint="construction logo" />
      </div>
      <nav className="flex flex-col gap-1 px-4">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            pathname === '/' && 'bg-sidebar-accent text-sidebar-accent-foreground'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          안전사고 분석 대시보드
        </Link>
        <Link
          href="/analysis"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            pathname === '/analysis' && 'bg-sidebar-accent text-sidebar-accent-foreground'
          )}
        >
          <BrainCircuit className="h-4 w-4" />
          AI 기반 데이터 분석
        </Link>
      </nav>
      <div className="mt-4 px-4">
        <Separator className="bg-sidebar-border" />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">필터</h2>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            초기화
          </Button>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="projectType" className="text-sm font-medium">
              사업 구분
            </Label>
            <Select
              value={filters.projectType}
              onValueChange={value => onFilterChange({ ...filters, projectType: value })}
            >
              <SelectTrigger id="projectType" className="mt-1">
                <SelectValue placeholder="모두" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? '모두' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="causeMain" className="text-sm font-medium">
              주요 사고 원인
            </Label>
            <Select
              value={filters.causeMain}
              onValueChange={value => onFilterChange({ ...filters, causeMain: value })}
            >
              <SelectTrigger id="causeMain" className="mt-1">
                <SelectValue placeholder="모두" />
              </SelectTrigger>
              <SelectContent>
                {causes.map(cause => (
                  <SelectItem key={cause} value={cause}>
                    {cause === 'all' ? '모두' : cause}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="projectCost" className="text-sm font-medium">
              공사비 규모 (원)
            </Label>
            <Slider
              id="projectCost"
              min={0}
              max={maxCost}
              step={100000}
              value={filters.projectCost}
              onValueChange={handleSliderChange}
              className="mt-3"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formatCost(filters.projectCost[0])}</span>
              <span>{formatCost(filters.projectCost[1])}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
