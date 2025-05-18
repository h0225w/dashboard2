import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Analytics from './pages/Analytics';
import LeadDataTable from './pages/LeadDataTable';

function App() {
  const [serverStatus, setServerStatus] = useState('checking');
  
  // 다크모드 초기화
  useEffect(() => {
    // 로컬 스토리지에서 테마 불러오기
    const savedTheme = localStorage.getItem('theme');
    
    // 선호 색상 모드 감지
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 저장된 테마가 있으면 그것을 사용, 없으면 시스템 테마 사용
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // FastAPI 백엔드의 API 엔드포인트에서 데이터 가져오기
    fetch('/api/hello')
      .then(response => {
        if (!response.ok) {
          throw new Error('서버 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then(data => {
        setServerStatus('connected');
      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setServerStatus('error');
      });
  }, []);

  // 서버 연결 오류 시 표시할 화면
  if (serverStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-nextlevel-50 dark:from-background dark:to-nextlevel-900/20 p-4">
        <div className="nxt-card-glow p-8 max-w-md w-full">
          <div className="flex items-center space-x-2 mb-6">
            <div className="nxt-gradient-bg rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-lg shadow-sm">NL</div>
            <h1 className="text-2xl font-bold nxt-gradient-text">NEXT LEVEL</h1>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-4">서버 연결 오류</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.
          </p>
          <div className="bg-secondary/50 p-4 rounded-md border border-border">
            <h3 className="font-semibold mb-2">문제 해결 방법:</h3>
            <ol className="list-decimal pl-4 space-y-1">
              <li>FastAPI 백엔드 서버가 실행 중인지 확인하세요.</li>
              <li>서버 실행 명령어: <code className="bg-muted px-2 py-1 rounded">python backend/app.py</code></li>
              <li>프록시 설정이 올바른지 확인하세요.</li>
            </ol>
          </div>
          <button
            className="mt-6 w-full py-2.5 nxt-gradient-bg text-white rounded-lg hover:shadow-glow transition-all"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 서버 상태 확인 중일 때 표시할 로딩 화면
  if (serverStatus === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-nextlevel-50 dark:from-background dark:to-nextlevel-900/20">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-nextlevel-200 border-t-nextlevel-600 rounded-full animate-spin dark:border-nextlevel-800 dark:border-t-nextlevel-400"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-nextlevel-300 border-t-nextlevel-600 rounded-full animate-spin dark:border-nextlevel-700 dark:border-t-nextlevel-400"></div>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <div className="nxt-gradient-bg rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm shadow-sm">NL</div>
            <h2 className="text-xl font-bold nxt-gradient-text">NEXT LEVEL</h2>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">서버 연결 확인 중...</p>
        </div>
      </div>
    );
  }

  // 메인 앱 렌더링
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LeadDataTable />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
