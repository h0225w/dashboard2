import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Rocket, TrendingUp, Zap, ArrowUpRight, Users, Sparkles, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DataSummary from '../components/dashboard/DataSummary';
import SourcesChart from '../components/dashboard/SourcesChart';
import TrendsChart from '../components/dashboard/TrendsChart';
import CampaignPerformanceChart from '../components/dashboard/CampaignPerformanceChart';
import { Button } from '../components/ui/button';
import { formatDate, groupBy } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import sampleData from '../data/sampleData.json';

/**
 * 메인 대시보드 페이지 컴포넌트
 */
const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const [localData, setLocalData] = useState(null);

  // 샘플 데이터 로드
  useEffect(() => {
    loadSampleData();
  }, []);

  // 샘플 데이터 로드 함수
  const loadSampleData = () => {
    setLoading(true);
    setAnimateIn(false);
    setIsUsingLiveData(false);
    
    // 약간의 지연을 주어 로딩 상태를 표시
    setTimeout(() => {
      setData(sampleData);
      setLastUpdated(new Date());
      setLoading(false);
      
      // 애니메이션 트리거
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
    }, 500);
  };

  // API에서 실제 데이터 가져오기
  const fetchLiveData = async () => {
    setLoading(true);
    setAnimateIn(false);
    
    // 이미 로드된 데이터가 있으면 그것을 사용
    if (localData) {
      setData(localData);
      setLastUpdated(new Date());
      setIsUsingLiveData(true);
      setLoading(false);
      
      // 데이터 로드 후 애니메이션 트리거
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
      return;
    }
    
    try {
      const response = await fetch('/api/sheet-data');
      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      setLocalData(jsonData); // 로드한 데이터를 localData에 저장
      setLastUpdated(new Date());
      setIsUsingLiveData(true);
      
      // 데이터를 sampleData.json 파일에 저장
      try {
        const saveResponse = await fetch('/api/save-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: jsonData })
        });
        
        if (!saveResponse.ok) {
          console.warn('sampleData.json 파일에 데이터 저장에 실패했습니다.');
        } else {
          console.log('실시간 데이터가 sampleData.json 파일에 성공적으로 저장되었습니다.');
        }
      } catch (saveErr) {
        console.error('데이터 저장 중 오류 발생:', saveErr);
      }
      
      // 데이터 로드 후 애니메이션 트리거
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
    } catch (err) {
      setError(err.message);
      console.error('데이터를 가져오는 데 실패했습니다:', err);
      // 오류 발생 시 샘플 데이터로 복원
      if (data.length === 0) {
        loadSampleData();
      }
    } finally {
      setLoading(false);
    }
  };

  // 실시간 데이터 새로고침 (강제로 API 호출)
  const refreshLiveData = async () => {
    setLoading(true);
    setAnimateIn(false);
    try {
      const response = await fetch('/api/sheet-data');
      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      setLocalData(jsonData); // 새로 로드한 데이터를 localData에 저장
      setLastUpdated(new Date());
      setIsUsingLiveData(true);
      
      // 데이터를 sampleData.json 파일에 저장
      try {
        const saveResponse = await fetch('/api/save-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: jsonData })
        });
        
        if (!saveResponse.ok) {
          console.warn('sampleData.json 파일에 데이터 저장에 실패했습니다.');
        } else {
          console.log('실시간 데이터가 sampleData.json 파일에 성공적으로 저장되었습니다.');
        }
      } catch (saveErr) {
        console.error('데이터 저장 중 오류 발생:', saveErr);
      }
      
      // 데이터 로드 후 애니메이션 트리거
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
    } catch (err) {
      setError(err.message);
      console.error('데이터를 가져오는 데 실패했습니다:', err);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 새로고침 핸들러
  const handleRefresh = () => {
    if (isUsingLiveData) {
      // 실시간 데이터를 사용하는 경우, 강제로 새로 불러옴
      refreshLiveData();
    } else {
      loadSampleData();
    }
  };

  // 유입 소스 차트 데이터 생성
  const sourceChartData = React.useMemo(() => {
    if (!data.length) return [];

    const sourceGroups = data.reduce((acc, item) => {
      const source = item.utmSource || '직접 유입';
      if (!acc[source]) acc[source] = 0;
      acc[source]++;
      return acc;
    }, {});

    return Object.entries(sourceGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // 날짜별 등록 추세 데이터 생성
  const trendsData = React.useMemo(() => {
    if (!data.length) return [];

    // 날짜별로 그룹화
    const dateGroups = data.reduce((acc, item) => {
      // 날짜만 추출 (시간 제외)
      const dateStr = item.submitAt ? formatDate(item.submitAt, 'yyyy-MM-dd') : 'unknown';
      if (dateStr === 'unknown') return acc;
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          total: 0,
          sources: {}
        };
      }
      
      acc[dateStr].total++;
      
      // 소스별 카운트
      const source = item.utmSource || '직접 유입';
      if (!acc[dateStr].sources[source]) {
        acc[dateStr].sources[source] = 0;
      }
      acc[dateStr].sources[source]++;
      
      return acc;
    }, {});

    // 주요 소스 (상위 3개) 추출
    const topSources = Object.entries(
      data.reduce((acc, item) => {
        const source = item.utmSource || '직접 유입';
        if (!acc[source]) acc[source] = 0;
        acc[source]++;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    // 배열로 변환 및 정렬
    return Object.values(dateGroups)
      .map(item => {
        const result = { date: item.date, total: item.total };
        
        // 주요 소스별 카운트 추가
        topSources.forEach(source => {
          result[source] = item.sources[source] || 0;
        });
        
        return result;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  // 캠페인 성과 데이터 생성
  const campaignData = React.useMemo(() => {
    if (!data.length) return [];

    const campaignGroups = data.reduce((acc, item) => {
      const campaign = item.utmCampaign || '(미지정)';
      
      if (!acc[campaign]) {
        acc[campaign] = {
          name: campaign,
          total: 0,
          variants: {}
        };
      }
      
      acc[campaign].total++;
      
      // 변형별 카운트
      const variant = item.pageVariant || 'default';
      if (!acc[campaign].variants[variant]) {
        acc[campaign].variants[variant] = 0;
      }
      acc[campaign].variants[variant]++;
      
      return acc;
    }, {});

    // 배열로 변환 및 정렬
    return Object.values(campaignGroups)
      .map(item => {
        const result = { name: item.name, total: item.total };
        
        // 변형별 카운트 추가
        Object.entries(item.variants).forEach(([variant, count]) => {
          result[`variant_${variant}`] = count;
        });
        
        return result;
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // 상위 5개 캠페인만 표시
  }, [data]);

  // 데이터 다운로드 핸들러 (CSV 형식)
  const handleDownload = () => {
    if (!data.length) return;
    
    // CSV 헤더 생성
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // 헤더 행
      ...data.map(row => 
        headers.map(header => {
          // 쉼표가 포함된 값은 따옴표로 감싸기
          const value = row[header] ? String(row[header]) : '';
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    // CSV 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `marketing_data_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 최신 트렌드 데이터 (예시)
  const trendingItems = [
    { title: "인스타그램 광고", change: "+24%", isUp: true },
    { title: "페이스북 리드", change: "+12%", isUp: true },
    { title: "구글 CPC", change: "-5%", isUp: false },
    { title: "이메일 오픈율", change: "+18%", isUp: true },
  ];

  // 스켈레톤 로딩 UI 컴포넌트
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="h-4 bg-gray-200 animate-pulse m-4 rounded-md w-1/3"></div>
      <div className="mx-4 mb-4 h-24 bg-gray-100 animate-pulse rounded-md"></div>
    </div>
  );

  const SkeletonMetricCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-7 bg-gray-300 rounded w-16"></div>
          <div className="h-2 bg-gray-200 rounded w-20 mt-2"></div>
        </div>
        <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      title="NEXT LEVEL 대시보드"
      actions={
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            disabled={loading || !data.length}
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            onClick={isUsingLiveData ? refreshLiveData : fetchLiveData}
            disabled={loading}
            className={`transition-all ${isUsingLiveData ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isUsingLiveData ? '실시간 데이터 다시 로드' : '실시간 데이터 로드'}
          </Button>
          <Button 
            variant="default"
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isUsingLiveData ? '실시간 데이터 새로고침' : '데이터 새로고침'}
          </Button>
        </div>
      }
    >
      {loading && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-56"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-44"></div>
          </div>
          
          {/* 스켈레톤 메트릭 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonMetricCard key={i} />
            ))}
          </div>
          
          {/* 스켈레톤 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
            <SkeletonCard />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl mb-6 shadow-sm">
          <p className="font-semibold mb-1">오류가 발생했습니다</p>
          <p className="text-sm mb-3">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-rose-200 hover:bg-rose-100" 
            onClick={handleRefresh}
          >
            다시 시도
          </Button>
        </div>
      )}
      
      {!loading && !error && (
        <div className={`space-y-8 transition-opacity duration-500 ease-in-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          {lastUpdated && (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                  마케팅 인사이트
                </h2>
                {!isUsingLiveData && (
                  <div className="text-xs text-gray-500 mt-1">
                    최근 갱신 데이터를 사용하고 있습니다. 서버에서 최신 데이터를 가져오려면 '실시간 데이터 로드' 버튼을 클릭하세요.
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm border">
                마지막 업데이트: {formatDate(lastUpdated, 'yyyy년 MM월 dd일 HH:mm')}
              </p>
            </div>
          )}
          
          {/* 대시보드는 데이터 분석 페이지이므로 API 호출을 최소화하기 위한 안내 추가 */}
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl shadow-sm border border-blue-100">
            <p className="font-medium flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              데이터 분석 모드
            </p>
            <p className="text-sm">대시보드 차트와 분석 컴포넌트는 API 사용량을 최소화하기 위해 항상 저장된 최근 갱신 데이터를 사용합니다.</p>
          </div>
          
          {/* 요약 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50 hover:translate-y-[-4px]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">총 리드 수</p>
                    <h3 className="text-3xl font-bold text-gray-800">{data.length || 0}</h3>
                    <p className="text-sm text-emerald-600 flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>+12.5% 증가</span>
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-xl text-white shadow-md">
                    <Users size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50 hover:translate-y-[-4px]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">전환율</p>
                    <h3 className="text-3xl font-bold text-gray-800">6.8%</h3>
                    <p className="text-sm text-emerald-600 flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>+2.4% 증가</span>
                    </p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-xl text-white shadow-md">
                    <Zap size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50 hover:translate-y-[-4px]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">방문자</p>
                    <h3 className="text-3xl font-bold text-gray-800">3,245</h3>
                    <p className="text-sm text-emerald-600 flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>+18.2% 증가</span>
                    </p>
                  </div>
                  <div className="bg-indigo-500 p-3 rounded-xl text-white shadow-md">
                    <Users size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-emerald-50 hover:translate-y-[-4px]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">평균 체류 시간</p>
                    <h3 className="text-3xl font-bold text-gray-800">2:34</h3>
                    <p className="text-sm text-rose-600 flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>-0.8% 감소</span>
                    </p>
                  </div>
                  <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-md">
                    <Rocket size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 lg:col-span-2 hover:translate-y-[-4px]">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">날짜별 등록 추세</CardTitle>
                    <CardDescription>일별 등록 수 통계</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>상세 보기</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <TrendsChart 
                  data={trendsData}
                  xAxisKey="date"
                  series={[
                    { name: '총 등록', key: 'total', color: '#8884d8' },
                    ...sourceChartData.slice(0, 3).map((source, index) => ({
                      name: source.name,
                      key: source.name,
                      color: ['#82ca9d', '#ffc658', '#ff8042'][index]
                    }))
                  ]}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:translate-y-[-4px]">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">트렌드 변화</CardTitle>
                    <CardDescription>주요 지표 변화 추이</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {trendingItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="font-medium group-hover:text-blue-600 transition-colors">{item.title}</span>
                      <span className={`flex items-center ${item.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.isUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
                        {item.change}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex justify-center items-center py-2 group transition-all">
                      더 보기
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:translate-y-[-4px]">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">유입 소스 분포</CardTitle>
                    <CardDescription>소스별 리드 획득 비율</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <SourcesChart 
                  data={sourceChartData} 
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:translate-y-[-4px]">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">캠페인별 성과</CardTitle>
                    <CardDescription>캠페인별 변형 분포 비교</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CampaignPerformanceChart 
                  data={campaignData}
                  xAxisKey="name"
                  metrics={[
                    { name: '총 등록', key: 'total', color: '#8884d8' },
                    { name: 'A 변형', key: 'variant_a', color: '#82ca9d' },
                    { name: 'B 변형', key: 'variant_b', color: '#ffc658' }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard; 