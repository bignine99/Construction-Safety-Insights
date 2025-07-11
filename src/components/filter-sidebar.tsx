'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';

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
  };

  const handleAnalysisClick = () => {
    toast({
      title: '기능 구현 중',
      description: '검색 조건에 따른 데이터 분석 기능은 현재 개발 중입니다.',
    });
  };

  const toMultiSelectOptions = (items: string[]) =>
    items.map(item => ({ label: item, value: item }));

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4 pt-12">
        <Image
          src="https://i.postimg.cc/dQ2dmQMV/image.png"
          alt="SMART 스마트건설사업단"
          width={400}
          height={128}
          className="h-auto w-full"
        />
      </div>
      <div className="mt-4 px-4">
        <Separator className="bg-sidebar-border" />
      </div>
      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">필터</h2>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={disabled}>
            초기화
          </Button>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="projectOwner" className="text-sm font-medium">
              특성 분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(projectOwners)}
              onValueChange={value =>
                onFilterChange({ ...filters, projectOwner: value })
              }
              defaultValue={filters.projectOwner}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="projectType" className="text-sm font-medium">
              용도 분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(projectTypes)}
              onValueChange={value =>
                onFilterChange({ ...filters, projectType: value })
              }
              defaultValue={filters.projectType}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label
              htmlFor="constructionTypeMain"
              className="text-sm font-medium"
            >
              공종 대분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(constructionTypeMains)}
              onValueChange={value =>
                onFilterChange({
                  ...filters,
                  constructionTypeMain: value,
                  constructionTypeSub: [],
                })
              }
              defaultValue={filters.constructionTypeMain}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label
              htmlFor="constructionTypeSub"
              className="text-sm font-medium"
            >
              공종 중분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(constructionTypeSubOptions)}
              onValueChange={value =>
                onFilterChange({ ...filters, constructionTypeSub: value })
              }
              defaultValue={filters.constructionTypeSub}
              placeholder="전체"
              className="mt-1"
              disabled={disabled || filters.constructionTypeMain.length === 0}
            />
          </div>
          <div>
            <Label htmlFor="objectMain" className="text-sm font-medium">
              사고객체 대분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(objectMains)}
              onValueChange={value =>
                onFilterChange({ ...filters, objectMain: value })
              }
              defaultValue={filters.objectMain}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="causeMain" className="text-sm font-medium">
              사고원인 대분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(causeMains)}
              onValueChange={value =>
                onFilterChange({ ...filters, causeMain: value })
              }
              defaultValue={filters.causeMain}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="resultMain" className="text-sm font-medium">
              사고 결과 대분류
            </Label>
            <MultiSelect
              options={toMultiSelectOptions(resultMains)}
              onValueChange={value =>
                onFilterChange({ ...filters, resultMain: value })
              }
              defaultValue={filters.resultMain}
              placeholder="전체"
              className="mt-1"
              disabled={disabled}
            />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <Button className="w-full" onClick={handleAnalysisClick} disabled>
            <Search className="mr-2 h-4 w-4" />
            검색 조건 데이터 분석
          </Button>
        </div>
      </div>
    </div>
  );
}
