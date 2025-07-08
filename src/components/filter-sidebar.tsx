import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
  const handleSliderChange = (value: number[]) => {
    onFilterChange({ ...filters, projectCost: value });
  };

  const formatCost = (cost: number) => {
    if (cost >= 100000000) return `${(cost / 100000000).toFixed(1)}억`;
    if (cost >= 10000) return `${Math.round(cost / 10000)}만`;
    return cost;
  };

  return (
    <div className="h-full w-full space-y-6 bg-sidebar p-4 text-sidebar-foreground">
      <h2 className="text-xl font-bold">필터</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="projectType" className="text-sm font-medium">
            프로젝트 유형
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
            공사 금액 (원)
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
  );
}
