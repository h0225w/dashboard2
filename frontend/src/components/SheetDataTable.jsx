import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import sampleData from '../data/sampleData.json';

/**
 * 스프레드시트 데이터를 테이블로 표시하는 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.apiEndpoint - API 엔드포인트 경로
 * @param {number} props.pageSize - 페이지당 표시할 행 수
 * @param {string} props.sortBy - 정렬할 열 이름
 * @param {string} props.sortOrder - 정렬 순서 ('asc' 또는 'desc')
 * @param {string} props.searchTerm - 검색어
 * @param {boolean} props.useSampleDataOnly - true일 경우 API 호출 없이 sampleData.json만 사용
 */
const SheetDataTable = ({ 
  apiEndpoint, 
  pageSize = 10, 
  sortBy = 'submitAt', 
  sortOrder = 'desc', 
  searchTerm = '',
  useSampleDataOnly = false 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [totalItems, setTotalItems] = useState(0);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [rawData, setRawData] = useState([]);

  // 초기 로딩 시 샘플 데이터 가져오기
  useEffect(() => {
    loadSampleData();
  }, []);

  // 데이터 처리 함수 (필터링, 정렬, 페이징)
  const processData = (sourceData) => {
    try {
      // 필터링 및 정렬 수행
      let filteredData = [...sourceData];
      
      // 검색어로 필터링
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(row => 
          Object.values(row).some(value => 
            value && String(value).toLowerCase().includes(searchTermLower)
          )
        );
      }
      
      // 정렬 기준 열이 존재하는 경우에만 정렬
      if (currentSortBy && filteredData.length > 0 && currentSortBy in filteredData[0]) {
        filteredData.sort((a, b) => {
          const aValue = a[currentSortBy];
          const bValue = b[currentSortBy];
          
          // null 값 처리
          if (aValue === null && bValue === null) return 0;
          if (aValue === null) return currentSortOrder === 'asc' ? -1 : 1;
          if (bValue === null) return currentSortOrder === 'asc' ? 1 : -1;
          
          // 문자열 비교
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return currentSortOrder === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          // 숫자 비교
          return currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
      }
      
      // 총 아이템 수 설정
      setTotalItems(filteredData.length);
      
      // 페이징 적용
      const start = (currentPage - 1) * pageSize;
      const paginatedData = filteredData.slice(start, start + pageSize);
      
      return paginatedData;
    } catch (err) {
      console.error("데이터 처리 중 오류가 발생했습니다.", err);
      throw err;
    }
  };

  // 샘플 데이터 로드 함수
  const loadSampleData = () => {
    setLoading(true);
    setIsUsingLiveData(false);
    
    // 간단한 지연을 추가하여 로딩 상태를 표시
    setTimeout(() => {
      try {
        setRawData(sampleData);
        const processedData = processData(sampleData);
        setData(processedData);
        setLoading(false);
      } catch (err) {
        setError("데이터 처리 중 오류가 발생했습니다.");
        console.error(err);
        setLoading(false);
      }
    }, 500);
  };

  // API에서 실제 데이터 가져오기
  const fetchLiveData = async () => {
    // 데이터 분석 전용 모드면 항상 sampleData만 사용
    if (useSampleDataOnly) {
      loadSampleData();
      return;
    }
    
    setLoading(true);
    
    // 이미 로드된 라이브 데이터가 있으면 그것을 사용
    if (localData) {
      setRawData(localData);
      try {
        const processedData = processData(localData);
        setData(processedData);
        setIsUsingLiveData(true);
        setLoading(false);
      } catch (err) {
        setError("데이터 처리 중 오류가 발생했습니다.");
        console.error(err);
        setLoading(false);
      }
      return;
    }
    
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setLocalData(jsonData); // 로드한 데이터를 로컬에 저장
      setRawData(jsonData);
      
      const processedData = processData(jsonData);
      setData(processedData);
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
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error('데이터를 가져오는 데 실패했습니다:', err);
      // 오류 발생 시 샘플 데이터로 복원
      loadSampleData();
    }
  };

  // 실시간 데이터 새로고침 (강제로 API 호출)
  const refreshLiveData = async () => {
    // 데이터 분석 전용 모드면 항상 sampleData만 사용
    if (useSampleDataOnly) {
      loadSampleData();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setLocalData(jsonData); // 새로 로드한 데이터를 로컬에 저장
      setRawData(jsonData);
      
      const processedData = processData(jsonData);
      setData(processedData);
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
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error('데이터를 가져오는 데 실패했습니다:', err);
    }
  };

  // 검색어, 정렬, 페이지 크기 변경 시 데이터 다시 처리
  useEffect(() => {
    // 첫 페이지로 리셋
    setCurrentPage(1);
    
    if (rawData.length > 0) {
      try {
        const processedData = processData(rawData);
        setData(processedData);
      } catch (err) {
        setError("데이터 처리 중 오류가 발생했습니다.");
        console.error(err);
      }
    }
  }, [searchTerm, currentSortBy, currentSortOrder, pageSize]);

  // 페이지 변경 시 데이터 다시 처리
  useEffect(() => {
    if (rawData.length > 0) {
      try {
        const processedData = processData(rawData);
        setData(processedData);
      } catch (err) {
        setError("데이터 처리 중 오류가 발생했습니다.");
        console.error(err);
      }
    }
  }, [currentPage]);

  // 정렬 토글 핸들러
  const handleSort = (columnName) => {
    // 같은 열을 클릭한 경우 정렬 순서 토글
    if (columnName === currentSortBy) {
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 열을 클릭한 경우 해당 열로 정렬, 기본 내림차순
      setCurrentSortBy(columnName);
      setCurrentSortOrder('desc');
    }
  };

  // 페이지 번호 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  // 다음 페이지로 이동
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 이전 페이지로 이동
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 정렬 아이콘 표시
  const renderSortIcon = (columnName) => {
    if (columnName !== currentSortBy) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return currentSortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 inline text-blue-600" />
      : <ArrowDown className="ml-2 h-4 w-4 inline text-blue-600" />;
  };

  // 데이터 로딩 상태 표시
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="rounded-md bg-gray-100 h-12 mb-4"></div>
        <div className="space-y-2">
          {[...Array(pageSize)].map((_, idx) => (
            <div key={idx} className="rounded-md bg-gray-100 h-10"></div>
          ))}
        </div>
      </div>
    );
  }

  // 오류 발생 시 표시
  if (error) {
    return (
      <div className="bg-rose-50 text-rose-600 p-4 rounded-lg mb-6">
        <p className="font-medium">오류가 발생했습니다</p>
        <p className="text-sm">{error}</p>
        <div className="flex space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="border-rose-200" 
            onClick={loadSampleData}
          >
            샘플 데이터 사용
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={isUsingLiveData ? refreshLiveData : fetchLiveData}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 표시
  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <p className="text-gray-500">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  // 테이블 열 헤더 생성
  const columns = Object.keys(data[0]).map(key => {
    // 열 헤더 표시 이름 변환
    const columnLabels = {
      id: 'ID',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      company: '회사명',
      position: '직책',
      utmSource: '유입 소스',
      utmMedium: '매체',
      utmCampaign: '캠페인',
      utmContent: '컨텐츠',
      utmTerm: '키워드',
      pageVariant: '변형',
      submitAt: '등록일시'
    };

    return {
      key,
      label: columnLabels[key] || key
    };
  });

  // 특정 열 숨기기
  const visibleColumns = columns.filter(col => !['id'].includes(col.key));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {!isUsingLiveData && (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-1 text-xs rounded-md mr-2">
              최근 갱신 데이터
            </span>
          )}
          전체 {totalItems}개 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}개 표시
        </p>
        
        {!useSampleDataOnly && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={isUsingLiveData ? refreshLiveData : fetchLiveData}
            disabled={loading}
            className={isUsingLiveData ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : ""}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isUsingLiveData ? "실시간 데이터 다시 로드" : "실시간 데이터 로드"}
          </Button>
        )}
      </div>
      
      <div className="border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-nextlevel-50 dark:bg-nextlevel-900/30 text-left">
                {visibleColumns.map(column => (
                  <th 
                    key={column.key}
                    className={`px-6 py-4 font-medium text-sm text-nextlevel-700 dark:text-nextlevel-300 transition-colors hover:bg-nextlevel-100 dark:hover:bg-nextlevel-800/50 cursor-pointer whitespace-nowrap ${
                      column.key === currentSortBy ? 'bg-nextlevel-100 dark:bg-nextlevel-800/70 text-nextlevel-800 dark:text-nextlevel-200 font-semibold' : ''
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {renderSortIcon(column.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  className="hover:bg-nextlevel-50/50 dark:hover:bg-nextlevel-900/10 transition-colors even:bg-gray-50/50 dark:even:bg-gray-900/10"
                >
                  {visibleColumns.map(column => (
                    <td 
                      key={`${row.id || rowIndex}-${column.key}`} 
                      className={`px-6 py-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap ${
                        column.key === 'submitAt' ? 'text-gray-500 dark:text-gray-400' : ''
                      }`}
                    >
                      {column.key === 'submitAt' && row[column.key] 
                        ? new Date(row[column.key]).toLocaleString('ko-KR')
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              페이지 {currentPage} / {totalPages}
            </span>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} dark:border-gray-700 dark:text-gray-300`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} dark:border-gray-700 dark:text-gray-300`}
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetDataTable; 