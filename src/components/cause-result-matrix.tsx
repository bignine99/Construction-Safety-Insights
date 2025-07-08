'use client';

import { useMemo } from 'react';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CauseResultMatrixProps {
  incidents: Incident[];
}

export default function CauseResultMatrix({ incidents }: CauseResultMatrixProps) {
  const { matrix, causeOrder, resultOrder, columnTotals, resultTotals, grandTotal } = useMemo(() => {
    const causeOrder = ['기타', '설계오류', '시공오류'];
    const matrix: Record<string, Record<string, number>> = {};
    const resultTotals: Record<string, number> = {};
    const columnTotals: Record<string, number> = { '기타': 0, '설계오류': 0, '시공오류': 0 };

    for (const incident of incidents) {
      const cause = incident.causeMain || '기타';
      const result = incident.resultMain || '분류불능';

      if (!matrix[result]) {
        matrix[result] = { '기타': 0, '설계오류': 0, '시공오류': 0 };
      }
      
      if(causeOrder.includes(cause)) {
        matrix[result][cause]++;
      } else {
        matrix[result]['기타']++;
      }
    }

    const resultOrder = Object.keys(matrix).sort((a, b) => a.localeCompare(b));
    
    for (const result of resultOrder) {
        const rowTotal = causeOrder.reduce((sum, cause) => sum + (matrix[result][cause] || 0), 0);
        resultTotals[result] = rowTotal;
    }
    
    for (const cause of causeOrder) {
        columnTotals[cause] = resultOrder.reduce((sum, result) => sum + (matrix[result][cause] || 0), 0);
    }
    
    const grandTotal = causeOrder.reduce((sum, cause) => sum + columnTotals[cause], 0);

    return { matrix, causeOrder, resultOrder, columnTotals, resultTotals, grandTotal };
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>사고원인-결과 인과관계</CardTitle>
        <CardDescription>
          주요 사고 원인과 결과 간의 관계
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-6 pt-0">
        <div className="max-h-[350px] overflow-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-[100px] font-bold">사고결과</TableHead>
                {causeOrder.map((cause) => (
                  <TableHead key={cause} className="text-right font-bold">{cause}</TableHead>
                ))}
                <TableHead className="text-right font-bold">총계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultOrder.map((result) => (
                <TableRow key={result}>
                  <TableCell className="font-medium">{result}</TableCell>
                  {causeOrder.map((cause) => (
                    <TableCell key={cause} className="text-right">
                      {(matrix[result][cause] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                   <TableCell className="text-right font-bold">
                      {(resultTotals[result] || 0).toLocaleString()}
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="sticky bottom-0 bg-card">
              <TableRow>
                <TableCell className="font-bold">총합계</TableCell>
                {causeOrder.map((cause) => (
                  <TableCell key={cause} className="text-right font-bold">
                    {(columnTotals[cause] || 0).toLocaleString()}
                  </TableCell>
                ))}
                 <TableCell className="text-right font-bold">
                    {grandTotal.toLocaleString()}
                 </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
