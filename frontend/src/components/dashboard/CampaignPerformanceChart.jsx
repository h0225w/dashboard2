import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Rectangle
} from 'recharts';
import { formatNumber } from '../../lib/utils';

/**
 * 캠페인 성과를 바 차트로 보여주는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트 데이터 배열
 * @param {string} props.title - 차트 제목
 * @param {string} props.description - 차트 설명
 * @param {string} props.xAxisKey - X축 데이터 키 (캠페인명)
 * @param {Array} props.metrics - 표시할 지표 배열 [{ name, key, color }]
 */
const CampaignPerformanceChart = ({
  data = [],
  title = '캠페인 성과 비교',
  description,
  xAxisKey = 'name',
  metrics = []
}) => {
  // 차트에 사용될 색상 팔레트
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  // 커스텀 Bar 형태
  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props;
    
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={1}
        radius={[4, 4, 0, 0]}
        className="opacity-90 hover:opacity-100 transition-opacity duration-300"
        filter="url(#shadow)"
      />
    );
  };

  // 차트 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-lg">
          <p className="font-medium mb-2 text-gray-800">{label}</p>
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
  if (!data.length || !metrics.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md border">
        <p className="text-muted-foreground">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      
      <div className="h-72 bg-white rounded-md p-4 border shadow-md">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            barGap={4}
            barCategoryGap={16}
            className="bg-white"
            animationDuration={800}
            animationEasing="ease-in-out"
          >
            {/* 그림자 정의 */}
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
              </filter>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f9fafb" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f3f4f6" stopOpacity={0.3}/>
              </linearGradient>
            </defs>

            {/* 배경 영역 */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#colorUv)" />
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} horizontal={true} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              angle={-45}
              textAnchor="end"
              height={70}
              stroke="#d1d5db"
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={(value) => formatNumber(value)}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 16 }} 
              iconType="circle"
              iconSize={10}
            />
            {metrics.map((metric, index) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.name}
                fill={metric.color || defaultColors[index % defaultColors.length]}
                shape={<CustomBar />}
                radius={[4, 4, 0, 0]}
                barSize={metrics.length > 1 ? 20 : 30}
                animationDuration={1500}
                isAnimationActive={true}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignPerformanceChart; 