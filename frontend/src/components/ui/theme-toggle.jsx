import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * 다크모드/라이트모드 토글 버튼 컴포넌트
 * @param {Object} props
 * @param {string} props.className - 추가적인 클래스명
 */
export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    // 로컬 스토리지에서 테마 불러오기 (없으면 시스템 테마 사용)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  // 테마 변경 함수
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 테마 변경 시 HTML 클래스와 로컬 스토리지 업데이트
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={theme === 'light' ? '어두운 모드로 전환' : '밝은 모드로 전환'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-700" />
      ) : (
        <Sun className="h-5 w-5 text-amber-300" />
      )}
    </button>
  );
} 