import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatNumber } from '../../lib/utils';

/**
 * 시간대별 데이터 분포를 보여주는 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 원본 데이터 배열
 * @param {string} props.title - 차트 제목
 * @param {string} props.description - 차트 설명
 * @param {string} props.groupBy - 그룹화 기준 ('hour', 'day', 'month')
 * @param {string} props.categoryKey - 카테고리로 사용할 데이터 키 (예: utmSource, courseName 등)
 * @param {boolean} props.useDarkTheme - 다크모드 사용 여부
 */
const TimeDistributionChart = ({
  data = [],
  title = '시간대별 분석',
  description,
  groupBy = 'hour',
  categoryKey = null,
  useDarkTheme = false
}) => {
  // 데이터를 시간대별로 가공
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // 시간대별 그룹화 함수
    const getTimeGroup = (dateStr) => {
      if (!dateStr) return null;
      
      try {
        const date = new Date(dateStr);
        
        switch(groupBy) {
          case 'hour':
            return date.getHours();
          case 'day':
            return date.getDate();
          case 'month':
            return date.getMonth() + 1; // 1-12 형식으로 반환
          case 'dayOfWeek':
            return date.getDay(); // 0-6 (일-토)
          default:
            return date.getHours();
        }
      } catch (e) {
        console.error('날짜 변환 오류:', e);
        return null;
      }
    };
    
    // 카테고리 값 가독성 향상을 위한 변환 함수
    const formatCategoryValue = (key, value) => {
      if (key === 'pageVariant') {
        if (value === 'a') return 'A 변형';
        if (value === 'b') return 'B 변형';
        if (value === 'default') return '기본 페이지';
      }
      return value;
    };
    
    // 카테고리별로 그룹화할지 여부
    if (categoryKey) {
      // 시간대별, 카테고리별 그룹화
      const timeGroups = {};
      const categories = new Set();
      
      // 데이터 그룹화
      data.forEach(item => {
        const timeGroup = getTimeGroup(item.submitAt);
        if (timeGroup === null) return;
        
        const rawCategory = item[categoryKey] || '(미지정)';
        const category = formatCategoryValue(categoryKey, rawCategory);
        categories.add(category);
        
        if (!timeGroups[timeGroup]) {
          timeGroups[timeGroup] = {};
        }
        
        if (!timeGroups[timeGroup][category]) {
          timeGroups[timeGroup][category] = 0;
        }
        
        timeGroups[timeGroup][category]++;
      });
      
      // 시간대 범위 설정
      let timeRange = [];
      if (groupBy === 'hour') {
        timeRange = Array.from({length: 24}, (_, i) => i); // 0-23
      } else if (groupBy === 'day') {
        timeRange = Array.from({length: 31}, (_, i) => i + 1); // 1-31
      } else if (groupBy === 'month') {
        timeRange = Array.from({length: 12}, (_, i) => i + 1); // 1-12
      } else if (groupBy === 'dayOfWeek') {
        timeRange = Array.from({length: 7}, (_, i) => i); // 0-6
      }
      
      // 주요 카테고리만 선별 (상위 5개)
      const topCategories = [...categories]
        .map(category => {
          let total = 0;
          Object.values(timeGroups).forEach(group => {
            total += group[category] || 0;
          });
          return { category, total };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(item => item.category);
        
      // 차트 데이터 형식으로 변환
      return timeRange.map(time => {
        const result = { time };
        
        topCategories.forEach(category => {
          result[category] = timeGroups[time]?.[category] || 0;
        });
        
        return result;
      });
    } else {
      // 시간대별 단순 카운트
      const timeGroups = {};
      
      data.forEach(item => {
        const timeGroup = getTimeGroup(item.submitAt);
        if (timeGroup === null) return;
        
        if (!timeGroups[timeGroup]) {
          timeGroups[timeGroup] = 0;
        }
        
        timeGroups[timeGroup]++;
      });
      
      // 시간대 범위 설정
      let timeRange = [];
      if (groupBy === 'hour') {
        timeRange = Array.from({length: 24}, (_, i) => i); // 0-23
      } else if (groupBy === 'day') {
        timeRange = Array.from({length: 31}, (_, i) => i + 1); // 1-31
      } else if (groupBy === 'month') {
        timeRange = Array.from({length: 12}, (_, i) => i + 1); // 1-12
      } else if (groupBy === 'dayOfWeek') {
        timeRange = Array.from({length: 7}, (_, i) => i); // 0-6
      }
      
      // 차트 데이터 형식으로 변환
      return timeRange.map(time => ({
        time,
        count: timeGroups[time] || 0
      }));
    }
  }, [data, groupBy, categoryKey]);
  
  // 시간대 레이블 포맷팅
  const formatTimeLabel = (time) => {
    if (groupBy === 'hour') {
      return `${time}시`;
    } else if (groupBy === 'day') {
      return `${time}일`;
    } else if (groupBy === 'month') {
      return `${time}월`;
    } else if (groupBy === 'dayOfWeek') {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return dayNames[time];
    }
    return time;
  };
  
  // 색상 팔레트
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', 
    '#FF8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'
  ];
  
  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 border rounded-md shadow-lg ${useDarkTheme ? 'bg-nextlevel-950 border-nextlevel-800 text-nextlevel-100' : 'bg-white border-nextlevel-100 text-gray-800'}`}>
          <p className="font-medium mb-2">{formatTimeLabel(label)}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center text-sm py-1.5">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-2">{entry.name === 'count' ? '총 건수' : entry.name}:</span>
              <span className="font-medium">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // 데이터가 없는 경우
  if (!chartData.length) {
    return (
      <div className={`flex items-center justify-center h-64 rounded-md border ${useDarkTheme ? 'bg-nextlevel-950/50 border-nextlevel-800 text-nextlevel-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p>표시할 데이터가 없습니다</p>
      </div>
    );
  }
  
  // 표시할 선 그래프 데이터 키 추출
  const dataKeys = categoryKey 
    ? [...new Set(chartData.flatMap(Object.keys))]
      .filter(key => key !== 'time')
      .sort()
    : ['count'];
    
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      
      <div className={`h-72 rounded-md p-4 border shadow-md ${useDarkTheme ? 'bg-nextlevel-950 border-nextlevel-800' : 'bg-white border-gray-200'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          >
            {/* 그림자 정의 */}
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
              </filter>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={useDarkTheme ? 'rgba(30, 41, 59, 0.8)' : 'rgba(249, 250, 251, 0.8)'} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={useDarkTheme ? 'rgba(15, 23, 42, 0.3)' : 'rgba(243, 244, 246, 0.3)'} stopOpacity={0.3}/>
              </linearGradient>
            </defs>

            {/* 배경 영역 */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#colorUv)" />
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={useDarkTheme ? '#334155' : '#e5e7eb'} 
              vertical={true} 
              horizontal={true} 
            />
            <XAxis
              dataKey="time"
              tickFormatter={formatTimeLabel}
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
                  {value === 'count' ? '총 건수' : value}
                </span>
              )}
            />
            
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key === 'count' ? '총 건수' : key}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 6, strokeWidth: 1, stroke: useDarkTheme ? '#1e293b' : '#fff', fill: colors[index % colors.length] }}
                strokeWidth={2}
                dot={{ strokeWidth: 1, stroke: useDarkTheme ? '#1e293b' : '#fff', r: 4, fill: colors[index % colors.length] }}
                filter="url(#shadow)"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeDistributionChart; 