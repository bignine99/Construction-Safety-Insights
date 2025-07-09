'use client';

import React, { useMemo } from 'react';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CauseResultMatrixProps {
  incidents: Incident[];
}

const CAUSE_ORDER: string[] = ['시공오류', '설계오류', '기타'];
const RESULT_ORDER: { key: string; label: string }[] = [
  { key: '끼임', label: '끼임' },
  { key: '물체에맞음', label: '물체에맞음' },
  { key: '넘어짐', label: '넘어짐' },
  { key: '기타', label: '기타' },
  { key: '떨어짐', label: '떨어짐' },
  { key: '절단베임', label: '베임' },
  { key: '부딪힘', label: '부딪힘' },
];

export default function CauseResultMatrix({ incidents }: CauseResultMatrixProps) {
  const { matrix, maxCount } = useMemo(() => {
    const matrixData: Record<string, Record<string, number>> = {};
    let max = 0;

    CAUSE_ORDER.forEach(cause => {
      matrixData[cause] = {};
      RESULT_ORDER.forEach(result => {
        matrixData[cause][result.key] = 0;
      });
    });

    for (const incident of incidents) {
      const cause = CAUSE_ORDER.includes(incident.causeMain)
        ? incident.causeMain
        : '기타';
      const resultKey = RESULT_ORDER.find(r => r.key === incident.resultMain)?.key;

      if (resultKey && matrixData[cause]) {
        matrixData[cause][resultKey] = (matrixData[cause][resultKey] || 0) + 1;
        if (matrixData[cause][resultKey] > max) {
          max = matrixData[cause][resultKey];
        }
      }
    }

    return { matrix: matrixData, maxCount: Math.max(1, max) };
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>사고원인-결과 인과관계</CardTitle>
        <CardDescription className="text-xs">주요 사고 원인에 따른 결과 분포</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <div className="grid h-full grid-cols-4 gap-x-1 gap-y-0 text-center text-xs">
          {/* Header - empty cell for corner */}
          <div /> 
          {CAUSE_ORDER.map((cause) => (
            <div key={cause} className="font-semibold text-muted-foreground">
              {cause}
            </div>
          ))}

          {/* Rows */}
          {RESULT_ORDER.map((result) => (
            <React.Fragment key={result.key}>
              <div className="flex items-center justify-start text-left font-medium text-muted-foreground">
                {result.label}
              </div>
              {CAUSE_ORDER.map((cause) => {
                const count = matrix[cause]?.[result.key] || 0;
                const size = count > 0 ? 12 + Math.sqrt(count / maxCount) * 20 : 0; 

                return (
                  <div key={`${cause}-${result.key}`} className="flex h-8 items-center justify-center">
                    {count > 0 && (
                      <div
                        className="flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                        }}
                        title={`${cause} > ${result.label}: ${count}건`}
                      >
                        <span className="text-xs font-semibold">{count}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
