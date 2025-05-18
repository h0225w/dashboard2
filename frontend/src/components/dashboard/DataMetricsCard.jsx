import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn, formatNumber } from '../../lib/utils';

/**
 * 핵심 메트릭을 보여주는 카드 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.title - 메트릭 제목
 * @param {string|number} props.value - 표시할 값
 * @param {string} props.description - 추가 설명
 * @param {number} props.change - 변화량 (퍼센트)
 * @param {React.ReactNode} props.icon - 표시할 아이콘
 * @param {string} props.className - 추가 CSS 클래스
 */
const DataMetricsCard = ({ 
  title, 
  value, 
  description, 
  change, 
  icon, 
  className 
}) => {
  // 변화량에 따른 상태 계산
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {/* 변화량 표시 */}
        {change !== undefined && (
          <div className="mt-2 flex items-center text-xs">
            {isPositive && (
              <div className="flex items-center text-emerald-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>{formatNumber(Math.abs(change), 1)}% 증가</span>
              </div>
            )}
            {isNegative && (
              <div className="flex items-center text-rose-500">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>{formatNumber(Math.abs(change), 1)}% 감소</span>
              </div>
            )}
            {!isPositive && !isNegative && (
              <span className="text-muted-foreground">변화 없음</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataMetricsCard; 