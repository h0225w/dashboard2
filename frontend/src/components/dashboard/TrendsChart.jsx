import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatDate, formatNumber } from '../../lib/utils';

/**
 * 시계열 데이터를 선 그래프로 보여주는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트 데이터 배열
 * @param {string} props.title - 차트 제목
 * @param {string} props.description - 차트 설명
 * @param {string} props.xAxisKey - X축 데이터 키
 * @param {Array} props.series - 표시할 데이터 시리즈 배열 [{ name, key, color }]
 * @param {boolean} props.useDarkTheme - 다크모드 사용 여부
 */
const TrendsChart = ({
  data = [],
  title = '추세 분석',
  description,
  xAxisKey = 'date',
  series = [],
  useDarkTheme = false
}) => {
  // 차트에 사용될 색상 팔레트
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  // 데이터가 있지만 series가 없다면, 데이터에서 자동 추출
  const activeItems = useMemo(() => {
    if (series.length > 0) return series;
    
    // data 배열에서 첫 번째 항목을 가져와서 모든 키 추출
    const firstItem = data[0];
    if (!firstItem) return [];
    
    // 차트에 쓰일 값 필드 추출 (X 축 키와 name/key/id/date 등 제외)
    return Object.keys(firstItem)
      .filter(key => key !== xAxisKey && key !== 'name' && key !== 'id' && key !== 'key' && key !== 'date')
      .map((key, index) => ({
        name: key,
        key,
        color: defaultColors[index % defaultColors.length]
      }));
  }, [data, series, xAxisKey, defaultColors]);

  // 차트 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 border rounded-md shadow-lg ${useDarkTheme ? 'bg-nextlevel-950 border-nextlevel-800 text-nextlevel-100' : 'bg-white border-nextlevel-100 text-gray-800'}`}>
          <p className="font-medium mb-2">{typeof label === 'number' ? label : formatDate(label)}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center text-sm py-1.5">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-2">{entry.name}:</span>
              <span className="font-medium">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // 데이터가 없는 경우
  if (!data.length || !activeItems.length) {
    return (
      <div className={`flex items-center justify-center h-64 rounded-md border ${useDarkTheme ? 'bg-nextlevel-950/50 border-nextlevel-800 text-nextlevel-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p>표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      
      <div className={`h-72 rounded-md p-4 border shadow-md ${useDarkTheme ? 'bg-nextlevel-950 border-nextlevel-800' : 'bg-white border-gray-200'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          >
            {/* 그림자 정의 */}
            <defs>
              <filter id="shadow-trends" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
              </filter>
              <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={useDarkTheme ? 'rgba(30, 41, 59, 0.8)' : 'rgba(249, 250, 251, 0.8)'} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={useDarkTheme ? 'rgba(15, 23, 42, 0.3)' : 'rgba(243, 244, 246, 0.3)'} stopOpacity={0.3}/>
              </linearGradient>
            </defs>

            {/* 배경 영역 */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#colorTrends)" />
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={useDarkTheme ? '#334155' : '#e5e7eb'} 
              vertical={true} 
              horizontal={true} 
            />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={(value) => typeof value === 'number' ? value : formatDate(value, 'MM/dd')}
              tick={{ fontSize: 12, fill: useDarkTheme ? '#94a3b8' : '#6b7280' }}
              stroke={useDarkTheme ? '#475569' : '#d1d5db'}
              axisLine={{ stroke: useDarkTheme ? '#475569' : '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={(value) => formatNumber(value)}
              tick={{ fontSize: 12, fill: useDarkTheme ? '#94a3b8' : '#6b7280' }}
              stroke={useDarkTheme ? '#475569' : '#d1d5db'}
              axisLine={{ stroke: useDarkTheme ? '#475569' : '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: useDarkTheme ? 'rgba(51, 65, 85, 0.5)' : 'rgba(224, 231, 255, 0.5)' }} />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span style={{ color: useDarkTheme ? '#e2e8f0' : '#111827' }}>
                  {value}
                </span>
              )}
            />
            {activeItems.map((item, index) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color || defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: useDarkTheme ? '#1e293b' : '#fff', fill: item.color || defaultColors[index % defaultColors.length] }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: useDarkTheme ? '#1e293b' : '#fff', fill: item.color || defaultColors[index % defaultColors.length] }}
                filter="url(#shadow-trends)"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart; 