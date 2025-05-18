import os
import sys
import uvicorn

if __name__ == "__main__":
    # 환경 변수 설정
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    # 프로덕션 모드 확인
    production = os.environ.get("PRODUCTION", "false").lower() == "true"
    
    # Uvicorn 서버 실행 옵션 설정
    uvicorn_options = {
        "host": host,
        "port": port,
        "app": "backend.app:app",
        "workers": 4 if production else 1,  # 프로덕션에서는 멀티 워커 사용
        "reload": not production,  # 개발 모드에서만 자동 리로드 활성화
    }
    
    print(f"{'프로덕션' if production else '개발'} 모드로 서버를 시작합니다...")
    print(f"주소: http://{host}:{port}")
    
    # Uvicorn 서버 실행
    uvicorn.run(**uvicorn_options) 