import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SheetDataTable from '../components/SheetDataTable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatDate } from '../lib/utils';
import sampleData from '../data/sampleData.json';

/**
 * 전체 데이터 테이블 페이지 컴포넌트
 */
const DataTablePage = () => {
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('submitAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // CSV 다운로드 핸들러
  const handleDownload = async () => {
    try {
      // API 호출 대신 sampleData 사용
      const data = sampleData;
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
      link.setAttribute('download', `all_data_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('데이터 다운로드 중 오류 발생:', error);
      alert('데이터 다운로드에 실패했습니다.');
    }
  };

  return (
    <DashboardLayout 
      title="전체 데이터 테이블"
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          CSV 다운로드
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-4 shadow-sm border border-blue-100">
          <p className="font-medium">최근 갱신 데이터를 사용 중입니다</p>
          <p className="text-sm">데이터 분석 섹션에서는 API 호출 없이 저장된 최근 갱신 데이터를 분석합니다.</p>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>이메일 등록 데이터</CardTitle>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">표시 개수:</label>
              <select
                className="h-8 rounded-md border border-input px-3 py-1 text-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5개</option>
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={50}>50개</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <SheetDataTable 
              apiEndpoint="/api/sheet-data"
              pageSize={pageSize}
              sortBy={sortBy}
              sortOrder={sortOrder}
              useSampleDataOnly={true}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataTablePage; 