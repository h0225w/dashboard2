import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, RefreshCcw, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SheetDataTable from '../components/SheetDataTable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import DataSummary from '../components/dashboard/DataSummary';
import { formatDate } from '../lib/utils';
import sampleData from '../data/sampleData.json';

/**
 * 리드 데이터 조회 페이지 컴포넌트
 */
const LeadDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('submitAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const [localData, setLocalData] = useState(null);

  // 컴포넌트 마운트 시 샘플 데이터 로드
  useEffect(() => {
    loadSampleData();
  }, []);

  // 샘플 데이터 로드
  const loadSampleData = () => {
    setLoading(true);
    
    // 간단한 지연을 추가하여 로딩 상태 표시
    setTimeout(() => {
      setData(sampleData);
      setLastUpdated(new Date());
      setIsUsingLiveData(false);
      setLoading(false);
    }, 500);
  };

  // 데이터 로드/새로고침 통합 함수
  const loadData = async () => {
    setLoading(true);
    
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
  
  // CSV 다운로드 핸들러
  const handleDownload = async () => {
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
    link.setAttribute('download', `lead_data_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 검색 핸들러
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <DashboardLayout 
      title="리드 데이터 조회"
      actions={
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            disabled={loading || !data.length}
            className="text-foreground hover:text-nextlevel-600 hover:bg-secondary transition-all"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
          <Button 
            variant={isUsingLiveData ? "outline" : "default"}
            size="sm" 
            onClick={loadData}
            disabled={loading}
            className={`transition-all ${isUsingLiveData ? 'bg-nextlevel-50 text-nextlevel-700 border-nextlevel-200 hover:bg-nextlevel-100 hover:text-nextlevel-800 dark:bg-nextlevel-900/30 dark:text-nextlevel-300 dark:border-nextlevel-800' : ''}`}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isUsingLiveData ? '데이터 새로고침' : '실시간 데이터 로드'}
          </Button>
        </div>
      }
    >
      {loading && <div className="flex justify-center py-8 text-foreground">데이터를 불러오는 중...</div>}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 shadow-sm dark:bg-destructive/20">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="font-semibold">오류가 발생했습니다</p>
          </div>
          <p className="text-sm mt-2 mb-3">{error}</p>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-destructive/20 hover:bg-destructive/10" 
              onClick={loadSampleData}
            >
              샘플 데이터 사용
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData}
            >
              다시 시도
            </Button>
          </div>
        </div>
      )}
      
      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium mb-2 text-foreground">표시할 데이터가 없습니다</p>
          <p className="text-sm text-muted-foreground">데이터를 추가하거나 서버 연결을 확인해 주세요</p>
        </div>
      )}
      
      {!loading && !error && data.length > 0 && (
        <div className="space-y-6">
          {/* 데이터 상태 표시 */}
          {lastUpdated && (
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                {!isUsingLiveData && (
                  <div className="text-xs text-muted-foreground flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1.5 dark:bg-yellow-500"></div>
                    최근 갱신 데이터를 사용하고 있습니다. 서버에서 최신 데이터를 가져오려면 '실시간 데이터 로드' 버튼을 클릭하세요.
                  </div>
                )}
                {isUsingLiveData && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div>
                    실시간 데이터를 사용 중입니다.
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground bg-card dark:bg-card px-3 py-2 rounded-lg shadow-sm border">
                마지막 업데이트: {formatDate(lastUpdated, 'yyyy년 MM월 dd일 HH:mm')}
              </p>
            </div>
          )}
        
          {/* 데이터 요약 섹션 */}
          <Card className="nxt-card-glow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg">데이터 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <DataSummary 
                data={data}
                title=""
              />
            </CardContent>
          </Card>
          
          {/* 데이터 테이블 섹션 */}
          <Card className="nxt-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-secondary/30 dark:bg-secondary/10 border-b pb-4">
              <CardTitle className="text-lg">리드 상세 데이터</CardTitle>
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                {/* 검색창 */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="데이터 검색..."
                    className="h-9 w-[200px] rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nextlevel-400 placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                {/* 페이지 사이즈 선택 */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground">표시 개수:</label>
                  <select
                    className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5개</option>
                    <option value={10}>10개</option>
                    <option value={20}>20개</option>
                    <option value={50}>50개</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pb-0">
              <div className="bg-nextlevel-50 text-nextlevel-700 p-4 shadow-sm border-b border-nextlevel-100 dark:bg-nextlevel-900/20 dark:text-nextlevel-300 dark:border-nextlevel-800">
                <p className="font-medium text-sm">데이터 분석 모드</p>
                <p className="text-xs">데이터 분석 페이지에서는 API 사용량을 최소화하기 위해 저장된 최근 갱신 데이터만 사용합니다.</p>
              </div>
              <SheetDataTable 
                apiEndpoint="/api/sheet-data"
                pageSize={pageSize}
                sortBy={sortBy}
                sortOrder={sortOrder}
                searchTerm={searchTerm}
                useSampleDataOnly={true}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeadDataTable; 