import React, { useMemo } from 'react';
import { 
  Users, 
  Mail, 
  Activity, 
  Calendar, 
  BarChart4,
  Tag
} from 'lucide-react';
import { formatNumber, formatDate } from '../../lib/utils';
import DataMetricsCard from './DataMetricsCard';

/**
 * 데이터 요약 정보를 표시하는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 원본 데이터 배열
 * @param {string} props.title - 섹션 제목
 * @param {Object} props.dateRange - 데이터 기간 {start, end}
 */
const DataSummary = ({
  data = [],
  title = '데이터 요약',
  dateRange = {}
}) => {
  // 데이터 그룹화 및 통계 계산
  const stats = useMemo(() => {
    if (!data.length) return null;

    // 유입 소스별 데이터 그룹화
    const sourceGroups = data.reduce((acc, item) => {
      const source = item.utmSource || '직접 유입';
      if (!acc[source]) acc[source] = 0;
      acc[source]++;
      return acc;
    }, {});

    // 캠페인별 데이터 그룹화
    const campaignGroups = data.reduce((acc, item) => {
      const campaign = item.utmCampaign || '(미지정)';
      if (!acc[campaign]) acc[campaign] = 0;
      acc[campaign]++;
      return acc;
    }, {});

    // 컨텐츠별 데이터 그룹화
    const contentGroups = data.reduce((acc, item) => {
      const content = item.utmContent || '(미지정)';
      if (!acc[content]) acc[content] = 0;
      acc[content]++;
      return acc;
    }, {});

    // 코스별 데이터 그룹화
    const courseGroups = data.reduce((acc, item) => {
      const course = item.courseName || '(미지정)';
      if (!acc[course]) acc[course] = 0;
      acc[course]++;
      return acc;
    }, {});

    // 최근 등록일 찾기
    const sortedByDate = [...data].sort((a, b) => 
      new Date(b.submitAt) - new Date(a.submitAt)
    );
    const latestSubmission = sortedByDate.length > 0 
      ? formatDate(sortedByDate[0].submitAt, 'yyyy년 MM월 dd일')
      : '데이터 없음';

    // 각 그룹에서 가장 많은 항목 찾기
    const topSource = Object.entries(sourceGroups).sort((a, b) => b[1] - a[1])[0];
    const topCampaign = Object.entries(campaignGroups).sort((a, b) => b[1] - a[1])[0];
    const topContent = Object.entries(contentGroups).sort((a, b) => b[1] - a[1])[0];
    const topCourse = Object.entries(courseGroups).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCount: data.length,
      latestSubmission,
      topSource,
      topCampaign,
      topContent,
      topCourse
    };
  }, [data]);

  // 데이터가 없는 경우
  if (!data.length || !stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}
      
      {dateRange.start && dateRange.end && (
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(dateRange.start, 'yyyy년 MM월 dd일')} ~ {formatDate(dateRange.end, 'yyyy년 MM월 dd일')} 데이터
        </p>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DataMetricsCard
          title="총 등록 수"
          value={formatNumber(stats.totalCount)}
          description="총 리드 등록 수"
          icon={<Users size={16} />}
        />
        
        <DataMetricsCard
          title="주요 유입 소스"
          value={stats.topSource ? stats.topSource[0] : '데이터 없음'}
          description={stats.topSource ? `${formatNumber(stats.topSource[1])}건 (${((stats.topSource[1] / data.length) * 100).toFixed(1)}%)` : ''}
          icon={<Activity size={16} />}
        />
        
        <DataMetricsCard
          title="인기 코스"
          value={stats.topCourse ? (stats.topCourse[0].length > 15 ? `${stats.topCourse[0].substring(0, 15)}...` : stats.topCourse[0]) : '데이터 없음'}
          description={stats.topCourse ? `${formatNumber(stats.topCourse[1])}건 (${((stats.topCourse[1] / data.length) * 100).toFixed(1)}%)` : ''}
          icon={<BarChart4 size={16} />}
        />
        
        <DataMetricsCard
          title="인기 캠페인"
          value={stats.topCampaign ? (stats.topCampaign[0].length > 15 ? `${stats.topCampaign[0].substring(0, 15)}...` : stats.topCampaign[0]) : '데이터 없음'}
          description={stats.topCampaign ? `${formatNumber(stats.topCampaign[1])}건 (${((stats.topCampaign[1] / data.length) * 100).toFixed(1)}%)` : ''}
          icon={<Mail size={16} />}
        />
        
        <DataMetricsCard
          title="인기 컨텐츠"
          value={stats.topContent ? (stats.topContent[0].length > 15 ? `${stats.topContent[0].substring(0, 15)}...` : stats.topContent[0]) : '데이터 없음'}
          description={stats.topContent ? `${formatNumber(stats.topContent[1])}건 (${((stats.topContent[1] / data.length) * 100).toFixed(1)}%)` : ''}
          icon={<Tag size={16} />}
        />
        
        <DataMetricsCard
          title="최근 등록일"
          value={stats.latestSubmission}
          description="가장 최근 등록된 날짜"
          icon={<Calendar size={16} />}
        />
      </div>
    </div>
  );
};

export default DataSummary; 