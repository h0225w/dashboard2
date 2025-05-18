import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { formatNumber } from '../../lib/utils';

/**
 * UTM Content 분포를 파이 차트로 보여주는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 데이터 배열
 * @param {string} props.title - 차트 제목
 * @param {string} props.description - 차트 설명
 */
const UtmContentChart = ({
  data = [],
  title = 'UTM 컨텐츠 분석',
  description = '컨텐츠 유형별 리드 획득 비율'
}) => {
  // 차트에 사용될 색상 팔레트
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // UTM Content 데이터 가공
  const chartData = useMemo(() => {
    // UTM Content별 데이터 그룹화
    const contentGroups = data.reduce((acc, item) => {
      const content = item.utmContent || '(미지정)';
      if (!acc[content]) acc[content] = 0;
      acc[content]++;
      return acc;
    }, {});
    
    // 차트 데이터 형식으로 변환
    return Object.entries(contentGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // 값이 큰 순서대로 정렬
      .slice(0, 7); // 상위 7개만 표시
  }, [data]);
  
  // 차트 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = ((value / data.length) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <p className="font-medium mb-1">{name}</p>
          <p className="text-sm">
            <span className="font-medium">{formatNumber(value)}</span> 건
          </p>
          <p className="text-sm">전체의 {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 레전드 렌더러
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[10px]">
              {entry.value.length > 10 ? `${entry.value.substring(0, 10)}...` : entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // 데이터가 없는 경우
  if (!data.length || !chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={65}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UtmContentChart; 