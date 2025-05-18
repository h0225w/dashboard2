import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Menu, X, LineChart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/theme-toggle';

/**
 * 대시보드 레이아웃 컴포넌트
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 표시될 컨텐츠
 * @param {string} props.title - 페이지 제목
 * @param {React.ReactNode} props.actions - 헤더에 표시될 액션 버튼들
 */
const DashboardLayout = ({ children, title, actions }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // 사이드바 토글 핸들러
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 사이드바 */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-card dark:bg-card shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b dark:border-border">
          <div className="flex items-center space-x-2">
            <div className="nxt-gradient-bg rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              NL
            </div>
            <h2 className="text-xl font-bold nxt-gradient-text">NEXT LEVEL</h2>
          </div>
          <button className="p-1 lg:hidden" onClick={toggleSidebar}>
            <X size={24} className="text-foreground" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="mb-6 px-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              대시보드
            </div>
          </div>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="flex items-center rounded-lg px-4 py-2.5 text-foreground hover:bg-secondary hover:text-nextlevel-600 transition-colors"
              >
                <Database className="mr-3 h-5 w-5" />
                <span className="font-medium">리드 데이터 조회</span>
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className="flex items-center rounded-lg px-4 py-2.5 text-foreground hover:bg-secondary hover:text-nextlevel-600 transition-colors"
              >
                <LineChart className="mr-3 h-5 w-5" />
                <span className="font-medium">데이터 분석</span>
              </Link>
            </li>
          </ul>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center mb-3">
                <LineChart className="w-4 h-4 text-nextlevel-600 mr-2" />
                <span className="text-sm font-medium text-foreground">20대 마케터를 위한 팁</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                UTM 태그 설정은 모든 캠페인의 기본입니다. 마케팅 채널별 효과를 분석할 수 있게 합니다.
              </p>
            </div>
          </div>
        </nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="flex h-16 items-center justify-between border-b bg-card dark:bg-card px-6">
          <div className="flex items-center">
            <button className="p-1 mr-4 lg:hidden" onClick={toggleSidebar}>
              <Menu size={24} className="text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>

          {/* 우측 헤더 항목들 */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {actions && actions}
          </div>
        </header>

        {/* 컨텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;