import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, BarChart, Filter, Table, Clock, Sparkles } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import TrendsChart from '../components/dashboard/TrendsChart';
import SourcesChart from '../components/dashboard/SourcesChart';
import UtmContentChart from '../components/dashboard/UtmContentChart';
import TimeDistributionChart from '../components/dashboard/TimeDistributionChart';
import { formatDate, groupBy } from '../lib/utils';
import sampleData from '../data/sampleData.json';

/**
 * 데이터 분석 페이지 컴포넌트
 */
const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sources');
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'week', 'month', 'quarter'
  const [timeGroupBy, setTimeGroupBy] = useState('hour'); // 'hour', 'day', 'month', 'dayOfWeek'
  const [timeCategory, setTimeCategory] = useState(''); // 시간대별 분석에서 선택된 카테고리
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // 다크모드 감지 이벤트 리스너
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // 데이터 로딩
  const loadData = () => {
    setLoading(true);
    try {
      // API 호출 없이 sampleData.json에서 직접 데이터 로드
      setData(sampleData);
      setLoading(false);
    } catch (err) {
      setError("데이터를 로드하는 데 실패했습니다.");
      console.error('데이터 로드 오류:', err);
      setLoading(false);
    }
  };

  // 초기 로딩 시 데이터 가져오기
  useEffect(() => {
    loadData();
  }, []);

  // 날짜 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    if (filterDate === 'all') return data;
    
    const now = new Date();
    let startDate;
    
    switch (filterDate) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      if (!item.submitAt) return false;
      const itemDate = new Date(item.submitAt);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, filterDate]);

  // 유입 소스 데이터
  const sourceData = useMemo(() => {
    if (!filteredData.length) return [];

    const sourceGroups = filteredData.reduce((acc, item) => {
      const source = item.utmSource || '직접 유입';
      if (!acc[source]) acc[source] = 0;
      acc[source]++;
      return acc;
    }, {});

    return Object.entries(sourceGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // 매체별 성과 데이터
  const mediumData = useMemo(() => {
    if (!filteredData.length) return [];

    const mediumGroups = filteredData.reduce((acc, item) => {
      const medium = item.utmMedium || '(미지정)';
      
      if (!acc[medium]) {
        acc[medium] = {
          name: medium,
          value: 0
        };
      }
      
      acc[medium].value++;
      return acc;
    }, {});

    return Object.values(mediumGroups)
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // UTM 컨텐츠 데이터
  const contentData = useMemo(() => {
    if (!filteredData.length) return [];
    
    // UTM Content별 데이터 그룹화
    const contentGroups = filteredData.reduce((acc, item) => {
      const content = item.utmContent || '(미지정)';
      if (!acc[content]) acc[content] = 0;
      acc[content]++;
      return acc;
    }, {});
    
    // 차트 데이터 형식으로 변환
    return Object.entries(contentGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // 값이 큰 순서대로 정렬
  }, [filteredData]);

  // A/B 테스트 성과 데이터
  const abTestData = useMemo(() => {
    if (!filteredData.length) return [];

    // 변형별 그룹화
    const byVariant = filteredData.reduce((acc, item) => {
      const variant = item.pageVariant || 'default';
      
      if (!acc[variant]) {
        acc[variant] = {
          name: variant === 'a' ? 'A 변형' : (variant === 'b' ? 'B 변형' : '기본 페이지'),
          value: 0,
          courses: {}
        };
      }
      
      acc[variant].value++;
      
      // 코스별 카운트
      const course = item.courseName || '(미지정)';
      if (!acc[variant].courses[course]) {
        acc[variant].courses[course] = 0;
      }
      acc[variant].courses[course]++;
      
      return acc;
    }, {});

    // 코스별 변형 성과 데이터
    const courseData = filteredData.reduce((acc, item) => {
      const course = item.courseName || '(미지정)';
      const variant = item.pageVariant || 'default';
      
      if (!acc[course]) {
        acc[course] = {
          name: course,
          total: 0,
          a: 0,
          b: 0,
          default: 0
        };
      }
      
      acc[course].total++;
      acc[course][variant]++;
      
      return acc;
    }, {});

    return {
      variants: Object.values(byVariant),
      courses: Object.values(courseData)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5) // 상위 5개 코스만 표시
    };
  }, [filteredData]);

  // 날짜 필터 버튼 렌더링
  const renderDateFilterButton = (value, label) => (
    <Button
      key={value}
      variant={filterDate === value ? "default" : "outline"}
      size="sm"
      onClick={() => setFilterDate(value)}
      className={`
        ${filterDate === value 
          ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
          : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
        }
      `}
    >
      {label}
    </Button>
  );

  // 시간대 그룹 버튼 렌더링
  const renderTimeGroupButton = (value, label, icon) => (
    <Button
      key={value}
      variant={timeGroupBy === value ? "default" : "outline"}
      size="sm"
      onClick={() => setTimeGroupBy(value)}
      className={`
        ${timeGroupBy === value 
          ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
          : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
        }
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Button>
  );

  return (
    <DashboardLayout title="데이터 분석">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nextlevel-600"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4">
          <p>{error}</p>
          <Button onClick={loadData} className="mt-2" variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 정보 알림 */}
          <div className="bg-nextlevel-50 text-nextlevel-700 p-4 rounded-xl shadow-sm border border-nextlevel-100 dark:bg-nextlevel-900/20 dark:text-nextlevel-300 dark:border-nextlevel-800">
            <p className="text-sm">
              <span className="font-medium">최근 갱신 데이터 사용 중:</span> API 사용량을 최소화하기 위해 저장된 데이터만 분석합니다.
            </p>
          </div>
          
          {/* 데이터 필터링 */}
          <Card className="nxt-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-nextlevel-600" />
                  데이터 필터링
                </CardTitle>
                <CardDescription className="text-xs text-right">
                  총 {filteredData.length}개 데이터 분석 중
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">기간 선택</label>
                  <div className="flex flex-wrap gap-2">
                    {renderDateFilterButton('all', '전체 기간')}
                    {renderDateFilterButton('week', '최근 7일')}
                    {renderDateFilterButton('month', '최근 30일')}
                    {renderDateFilterButton('quarter', '최근 90일')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 분석 탭 */}
          <Tabs defaultValue="sources" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-4 gap-1">
              <TabsTrigger value="sources">유입 경로 분석</TabsTrigger>
              <TabsTrigger value="contents">컨텐츠 성과</TabsTrigger>
              <TabsTrigger value="time">시간대별 분석</TabsTrigger>
              <TabsTrigger value="abtest">A/B 테스트</TabsTrigger>
            </TabsList>
            
            {/* 유입 경로 분석 탭 */}
            <TabsContent value="sources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">유입 소스 분포</CardTitle>
                    <CardDescription>어떤 채널에서 사용자가 가장 많이 유입되었는지 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <SourcesChart 
                        data={sourceData} 
                        useDarkTheme={isDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">매체별 분포</CardTitle>
                    <CardDescription>어떤 매체를 통해 유입되었는지 분석하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <SourcesChart 
                        data={mediumData} 
                        useDarkTheme={isDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="nxt-card">
                <CardHeader>
                  <CardTitle className="text-lg">유입 소스 상세 분석</CardTitle>
                  <CardDescription>소스별 유입 건수와 비율을 확인하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30 dark:bg-secondary/10">
                          <th className="px-4 py-3 text-left font-medium text-foreground">소스</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">건수</th>
                          <th className="px-4 py-3 text-right font-medium text-foreground">비율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sourceData.map((source, index) => (
                          <tr key={index} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{source.name}</td>
                            <td className="px-4 py-3 text-center text-foreground">{source.value}</td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">
                              {((source.value / filteredData.length) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="nxt-card">
                <CardHeader>
                  <CardTitle className="text-lg">매체 상세 분석</CardTitle>
                  <CardDescription>매체별 유입 건수와 비율을 확인하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30 dark:bg-secondary/10">
                          <th className="px-4 py-3 text-left font-medium text-foreground">매체</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">건수</th>
                          <th className="px-4 py-3 text-right font-medium text-foreground">비율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mediumData.map((medium, index) => (
                          <tr key={index} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{medium.name}</td>
                            <td className="px-4 py-3 text-center text-foreground">{medium.value}</td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">
                              {((medium.value / filteredData.length) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 컨텐츠 성과 탭 */}
            <TabsContent value="contents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">컨텐츠별 성과</CardTitle>
                    <CardDescription>어떤 컨텐츠가 가장 많은 관심을 받았는지 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <SourcesChart 
                        data={contentData} 
                        useDarkTheme={isDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">주요 컨텐츠 분석</CardTitle>
                    <CardDescription>상위 컨텐츠 성과를 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {contentData.slice(0, 5).map((content, index) => {
                        // 첫 번째 항목의 값을 기준으로 퍼센티지 계산 (0으로 나누는 오류 방지)
                        const maxValue = contentData[0]?.value || 1;
                        const percentage = Math.min(100, Math.round((content.value / maxValue) * 100));
                        
                        // 고정 색상 배열 정의 (tailwind 색상을 CSS 색상값으로 설정)
                        const colors = [
                          { bg: '#3b82f6', dot: '#3b82f6', darkBg: '#2563eb' },  // blue
                          { bg: '#8b5cf6', dot: '#8b5cf6', darkBg: '#7c3aed' },  // purple
                          { bg: '#10b981', dot: '#10b981', darkBg: '#059669' },  // green
                          { bg: '#f59e0b', dot: '#f59e0b', darkBg: '#d97706' },  // amber
                          { bg: '#f43f5e', dot: '#f43f5e', darkBg: '#e11d48' }   // rose
                        ];
                        const color = colors[index % colors.length];
                        
                        return (
                          <div key={content.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: isDarkMode ? color.darkBg : color.dot }}
                                ></span>
                                <span className="font-medium text-foreground">
                                  {content.name.length > 20 ? `${content.name.substring(0, 20)}...` : content.name}
                                </span>
                              </div>
                              <span className="text-sm text-nextlevel-700 dark:text-nextlevel-400 bg-nextlevel-50 dark:bg-nextlevel-900/40 px-2 py-1 rounded-full">
                                {content.value}명
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: percentage > 0 ? `${percentage}%` : '2%',
                                  backgroundColor: isDarkMode ? color.darkBg : color.bg 
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="nxt-card">
                <CardHeader>
                  <CardTitle className="text-lg">컨텐츠 상세 분석</CardTitle>
                  <CardDescription>컨텐츠별 유입 건수와 비율을 확인하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30 dark:bg-secondary/10">
                          <th className="px-4 py-3 text-left font-medium text-foreground">컨텐츠</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">건수</th>
                          <th className="px-4 py-3 text-right font-medium text-foreground">비율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentData.slice(0, 10).map((content, index) => (
                          <tr key={index} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{content.name}</td>
                            <td className="px-4 py-3 text-center text-foreground">{content.value}</td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">
                              {((content.value / filteredData.length) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 시간대별 분석 탭 */}
            <TabsContent value="time" className="space-y-4">
              <Card className="nxt-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">시간대별 분석</CardTitle>
                    <CardDescription>시간대별로 어떤 패턴이 있는지 확인하세요</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderTimeGroupButton('hour', '시간별', <Clock className="w-4 h-4" />)}
                    {renderTimeGroupButton('dayOfWeek', '요일별')}
                    {renderTimeGroupButton('day', '일별')}
                    {renderTimeGroupButton('month', '월별')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-medium text-foreground">데이터 분류 기준</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Button
                          variant={timeCategory === '' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeCategory('')}
                          className={`
                            ${timeCategory === '' 
                              ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
                              : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
                            }
                          `}
                        >
                          전체
                        </Button>
                        <Button
                          variant={timeCategory === 'utmSource' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeCategory('utmSource')}
                          className={`
                            ${timeCategory === 'utmSource' 
                              ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
                              : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
                            }
                          `}
                        >
                          유입 소스별
                        </Button>
                        <Button
                          variant={timeCategory === 'utmMedium' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeCategory('utmMedium')}
                          className={`
                            ${timeCategory === 'utmMedium' 
                              ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
                              : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
                            }
                          `}
                        >
                          매체별
                        </Button>
                        <Button
                          variant={timeCategory === 'pageVariant' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeCategory('pageVariant')}
                          className={`
                            ${timeCategory === 'pageVariant' 
                              ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
                              : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
                            }
                          `}
                        >
                          A/B 테스트 변형별
                        </Button>
                        <Button
                          variant={timeCategory === 'courseName' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeCategory('courseName')}
                          className={`
                            ${timeCategory === 'courseName' 
                              ? 'bg-nextlevel-600 hover:bg-nextlevel-700' 
                              : 'hover:bg-secondary hover:text-nextlevel-600 text-foreground border-nextlevel-100 dark:border-nextlevel-800'
                            }
                          `}
                        >
                          코스별
                        </Button>
                      </div>
                    </div>
                    <div className="h-80">
                      <TimeDistributionChart 
                        data={filteredData} 
                        groupBy={timeGroupBy}
                        categoryKey={timeCategory}
                        useDarkTheme={isDarkMode}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* A/B 테스트 탭 */}
            <TabsContent value="abtest" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">A/B 테스트 성과</CardTitle>
                    <CardDescription>각 변형별 성과를 비교해보세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <SourcesChart 
                        data={abTestData.variants} 
                        useDarkTheme={isDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="nxt-card">
                  <CardHeader>
                    <CardTitle className="text-lg">주요 코스별 변형 성과</CardTitle>
                    <CardDescription>코스별로 어떤 변형이 효과적인지 비교하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {abTestData.courses.slice(0, 5).map((course, index) => (
                        <div key={course.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6' }}></span>
                              <span className="font-medium text-foreground">{course.name}</span>
                            </div>
                            <span className="text-sm text-nextlevel-700 dark:text-nextlevel-400 bg-nextlevel-50 dark:bg-nextlevel-900/40 px-2 py-1 rounded-full">
                              총 {course.total}명
                            </span>
                          </div>
                          
                          <div className="flex gap-2 items-center text-sm">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>A 변형: {course.a || 0}명</span>
                                <span>{course.a ? ((course.a / course.total) * 100).toFixed(1) : 0}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${course.a ? ((course.a / course.total) * 100) : 0}%`,
                                    backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6'
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>B 변형: {course.b || 0}명</span>
                                <span>{course.b ? ((course.b / course.total) * 100).toFixed(1) : 0}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${course.b ? ((course.b / course.total) * 100) : 0}%`,
                                    backgroundColor: isDarkMode ? '#059669' : '#10b981'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="nxt-card">
                <CardHeader>
                  <CardTitle className="text-lg">A/B 테스트 상세 결과</CardTitle>
                  <CardDescription>변형별 성과 지표를 비교 분석하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30 dark:bg-secondary/10">
                          <th className="px-4 py-3 text-left font-medium text-foreground">코스명</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">총 등록</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">A 변형</th>
                          <th className="px-4 py-3 text-center font-medium text-foreground">B 변형</th>
                          <th className="px-4 py-3 text-right font-medium text-foreground">변형 효과</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abTestData.courses.map((course, index) => {
                          // A와 B 변형 중 어떤 것이 더 효과적인지 계산
                          const conversionA = course.a / course.total;
                          const conversionB = course.b / course.total;
                          const improvement = conversionB > conversionA 
                            ? ((conversionB - conversionA) / conversionA * 100).toFixed(1)
                            : ((conversionA - conversionB) / conversionB * 100).toFixed(1);
                          
                          const betterVariant = conversionB > conversionA ? 'B' : 'A';
                          
                          return (
                            <tr key={index} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">{course.name}</td>
                              <td className="px-4 py-3 text-center text-foreground">{course.total}</td>
                              <td className="px-4 py-3 text-center text-foreground">
                                {course.a} ({course.a ? ((course.a / course.total) * 100).toFixed(1) : 0}%)
                              </td>
                              <td className="px-4 py-3 text-center text-foreground">
                                {course.b} ({course.b ? ((course.b / course.total) * 100).toFixed(1) : 0}%)
                              </td>
                              <td className="px-4 py-3 text-right">
                                {course.a && course.b ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    betterVariant === 'B' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  }`}>
                                    {betterVariant} 변형이 {improvement}% 좋음
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">데이터 부족</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics; 