'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface FilterSidebarProps {
  filters: {
    constructionTypeMain: string;
    constructionTypeSub: string;
    objectMain: string;
    causeMain: string;
    resultMain: string;
  };
  onFilterChange: (filters: any) => void;
  constructionTypeMains: string[];
  constructionTypeSubs: string[];
  objectMains: string[];
  causeMains: string[];
  resultMains: string[];
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  constructionTypeMains,
  constructionTypeSubs,
  objectMains,
  causeMains,
  resultMains,
}: FilterSidebarProps) {
  const { toast } = useToast();

  const handleReset = () => {
    onFilterChange({
      constructionTypeMain: 'all',
      constructionTypeSub: 'all',
      objectMain: 'all',
      causeMain: 'all',
      resultMain: 'all',
    });
  };

  const handleAnalysisClick = () => {
    toast({
      title: '기능 구현 중',
      description: '검색 조건에 따른 데이터 분석 기능은 현재 개발 중입니다.',
    });
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4 pt-6">
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
          <Button variant="ghost" size="sm" onClick={handleReset}>
            초기화
          </Button>
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <Label
              htmlFor="constructionTypeMain"
              className="text-sm font-medium"
            >
              공종 대분류
            </Label>
            <Select
              value={filters.constructionTypeMain}
              onValueChange={(value) =>
                onFilterChange({ ...filters, constructionTypeMain: value })
              }
            >
              <SelectTrigger id="constructionTypeMain" className="mt-1">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {constructionTypeMains.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? '전체' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="constructionTypeSub"
              className="text-sm font-medium"
            >
              공종 중분류
            </Label>
            <Select
              value={filters.constructionTypeSub}
              onValueChange={(value) =>
                onFilterChange({ ...filters, constructionTypeSub: value })
              }
            >
              <SelectTrigger id="constructionTypeSub" className="mt-1">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {constructionTypeSubs.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? '전체' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="objectMain" className="text-sm font-medium">
              사고객체 대분류
            </Label>
            <Select
              value={filters.objectMain}
              onValueChange={(value) =>
                onFilterChange({ ...filters, objectMain: value })
              }
            >
              <SelectTrigger id="objectMain" className="mt-1">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {objectMains.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? '전체' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="causeMain" className="text-sm font-medium">
              사고원인 대분류
            </Label>
            <Select
              value={filters.causeMain}
              onValueChange={(value) =>
                onFilterChange({ ...filters, causeMain: value })
              }
            >
              <SelectTrigger id="causeMain" className="mt-1">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {causeMains.map((cause) => (
                  <SelectItem key={cause} value={cause}>
                    {cause === 'all' ? '전체' : cause}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="resultMain" className="text-sm font-medium">
              사고 결과 대분류
            </Label>
            <Select
              value={filters.resultMain}
              onValueChange={(value) =>
                onFilterChange({ ...filters, resultMain: value })
              }
            >
              <SelectTrigger id="resultMain" className="mt-1">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {resultMains.map((result) => (
                  <SelectItem key={result} value={result}>
                    {result === 'all' ? '전체' : result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <Button className="w-full" onClick={handleAnalysisClick}>
            <Search className="mr-2 h-4 w-4" />
            검색 조건 데이터 분석
          </Button>
        </div>
      </div>
    </div>
  );
}
