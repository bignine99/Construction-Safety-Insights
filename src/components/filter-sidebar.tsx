'use client';

import Image from 'next/image';
import { Search, RotateCcw, Filter, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: {
    projectOwner: string[];
    projectType: string[];
    constructionTypeMain: string[];
    constructionTypeSub: string[];
    objectMain: string[];
    causeMain: string[];
    resultMain: string[];
  };
  onFilterChange: (filters: any) => void;
  projectOwners: string[];
  projectTypes: string[];
  constructionTypeMains: string[];
  constructionTypeSubs: string[];
  objectMains: string[];
  causeMains: string[];
  resultMains: string[];
  constructionTypeSubOptions: string[];
  disabled?: boolean;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  projectOwners,
  projectTypes,
  constructionTypeMains,
  constructionTypeSubs,
  objectMains,
  causeMains,
  resultMains,
  constructionTypeSubOptions,
  disabled = false,
}: FilterSidebarProps) {
  const { toast } = useToast();

  const handleReset = () => {
    onFilterChange({
      projectOwner: [],
      projectType: [],
      constructionTypeMain: [],
      constructionTypeSub: [],
      objectMain: [],
      causeMain: [],
      resultMain: [],
    });
    toast({
      description: '모든 필터가 초기화되었습니다.',
    });
  };

  const toMultiSelectOptions = (items: string[]) =>
    items.map(item => ({ label: item, value: item }));

  const FilterSection = ({ label, id, options, value, onChange, placeholder, disabled: sectionDisabled }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <Label htmlFor={id} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </Label>
        {value.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
            {value.length}
          </span>
        )}
      </div>
      <MultiSelect
        options={toMultiSelectOptions(options)}
        onValueChange={onChange}
        defaultValue={value}
        placeholder={placeholder || "전체 선택됨"}
        className={cn(
          "bg-white",
          sectionDisabled && "opacity-50 grayscale"
        )}
        disabled={disabled || sectionDisabled}
      />
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-slate-50/50 border-r border-slate-200/60">
      <div className="p-6 pb-2">
        <div className="relative group overflow-hidden rounded-xl border border-slate-100 p-2 bg-slate-50/50">
          <Image
            src="https://i.postimg.cc/dQ2dmQMV/image.png"
            alt="SMART 스마트건설사업단"
            width={400}
            height={128}
            className="h-auto w-full mix-blend-multiply"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-slate-100/30">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 tracking-tight">정밀 분석 설정</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset} 
          disabled={disabled}
          className="h-7 px-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          초기화
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        <FilterSection
          label="특성 분류"
          id="projectOwner"
          options={projectOwners}
          value={filters.projectOwner}
          onChange={(v: string[]) => onFilterChange({ ...filters, projectOwner: v })}
        />
        
        <FilterSection
          label="용도 분류"
          id="projectType"
          options={projectTypes}
          value={filters.projectType}
          onChange={(v: string[]) => onFilterChange({ ...filters, projectType: v })}
        />

        <Separator className="bg-slate-100" />

        <FilterSection
          label="공종 대분류"
          id="constructionTypeMain"
          options={constructionTypeMains}
          value={filters.constructionTypeMain}
          onChange={(v: string[]) => onFilterChange({ ...filters, constructionTypeMain: v, constructionTypeSub: [] })}
        />

        <FilterSection
          label="공종 중분류"
          id="constructionTypeSub"
          options={constructionTypeSubOptions}
          value={filters.constructionTypeSub}
          onChange={(v: string[]) => onFilterChange({ ...filters, constructionTypeSub: v })}
          disabled={filters.constructionTypeMain.length === 0}
          placeholder={filters.constructionTypeMain.length === 0 ? "대분류를 먼저 선택하세요" : "전체"}
        />

        <Separator className="bg-slate-100" />

        <FilterSection
          label="사고객체 대분류"
          id="objectMain"
          options={objectMains}
          value={filters.objectMain}
          onChange={(v: string[]) => onFilterChange({ ...filters, objectMain: v })}
        />

        <FilterSection
          label="사고원인 대분류"
          id="causeMain"
          options={causeMains}
          value={filters.causeMain}
          onChange={(v: string[]) => onFilterChange({ ...filters, causeMain: v })}
        />

        <FilterSection
          label="사고 결과 대분류"
          id="resultMain"
          options={resultMains}
          value={filters.resultMain}
          onChange={(v: string[]) => onFilterChange({ ...filters, resultMain: v })}
        />
      </div>

      <div className="p-6 border-t border-slate-200/60 bg-slate-100/30">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Filters</span>
            <span className="text-xs font-bold text-slate-700">실시간 조건 분석 중</span>
          </div>
        </div>
      </div>
    </div>
  );
}
