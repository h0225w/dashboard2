import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// 차트 색상 팔레트
const COLORS = ['#7c3cff', '#38bdf8', '#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

/**
 * 유입 소스 분포를 파이 차트로 보여주는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트 데이터 배열 (배열 요소: { name: string, value: number })
 * @param {string} props.title - 차트 제목
 * @param {string} props.description - 차트 설명
 * @param {boolean} props.useDarkTheme - 다크모드 사용 여부
 */
const SourcesChart = ({ 
  data = [], 
  title = '유입 소스 분포',
  description,
  useDarkTheme = false
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // 특정 섹션에 마우스를 올리면 활성화
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  // 마우스가 벗어나면 비활성화
  const onPieLeave = useCallback(
    () => {
      setActiveIndex(null);
    },
    [setActiveIndex]
  );

  // 차트 카스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${useDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 border shadow-lg rounded-md`}>
          <p className={`font-medium ${useDarkTheme ? 'text-white' : 'text-gray-800'} mb-2`}>{payload[0].name}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">{payload[0].value}</span> 건
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((payload[0].value / data.reduce((sum, entry) => sum + entry.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 데이터가 없는 경우 표시
  if (!data.length) {
    return (
      <div className={`flex items-center justify-center h-64 ${useDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} rounded-md border ${useDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-muted-foreground">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-semibold mb-2 text-foreground">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      
      <div className={`h-72 ${useDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-md p-4 border ${useDarkTheme ? 'border-gray-700' : 'border-gray-200'} shadow-md`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="shadow-pie" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
              </filter>
              <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={useDarkTheme ? "#1f2937" : "#f9fafb"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={useDarkTheme ? "#111827" : "#f3f4f6"} stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            {/* 배경 영역 */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" rx="8" />
            
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke={useDarkTheme ? "#374151" : "#ffffff"}
              strokeWidth={2}
              animationDuration={1200}
              animationBegin={200}
              filter="url(#shadow-pie)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? (useDarkTheme ? '#374151' : '#fff') : 'transparent'}
                  strokeWidth={2}
                  style={{
                    filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))' : 'none',
                    opacity: activeIndex === index ? 1 : 0.85,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry, index) => (
                <span className={`text-sm font-medium ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  {value}
                </span>
              )}
              iconSize={10}
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SourcesChart; 