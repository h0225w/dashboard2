from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
import requests
import json
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv

# .env 파일 로드 (없으면 환경 변수에서 로드)
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(title="FastAPI + React 통합 앱")

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SheetDB API URL (환경 변수에서 로드)
SHEETDB_API_ID = os.getenv("SHEETDB_API_ID")  # 환경 변수가 없을 경우 기본값 사용
SHEETDB_BASE_URL = f"https://sheetdb.io/api/v1/{SHEETDB_API_ID}"

# sampleData.json 파일 경로
SAMPLE_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/src/data/sampleData.json")

# API 응답을 위한 Pydantic 모델
class SheetRecord(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phoneNo: Optional[str] = None
    courseName: Optional[str] = None
    pageVariant: Optional[str] = None
    utmSource: Optional[str] = None
    utmMedium: Optional[str] = None
    utmCampaign: Optional[str] = None
    utmTerm: Optional[str] = None
    utmContent: Optional[str] = None
    submitAt: Optional[str] = None

class DataSaveRequest(BaseModel):
    data: List[Dict[str, Any]]

# API 엔드포인트 예시
@app.get("/api/hello")
async def hello():
    return {"message": "안녕하세요! FastAPI 백엔드에서 보내는 메시지입니다."}

# SheetDB에서 데이터를 가져오는 엔드포인트
@app.get("/api/sheet-data", response_model=List[SheetRecord])
async def get_sheet_data(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None
):
    """
    SheetDB API에서 데이터를 가져옵니다.
    
    - limit: 가져올 행 수 제한
    - offset: 시작 위치 (건너뛸 결과 수)
    - sort_by: 정렬할 열 이름
    - sort_order: 정렬 순서 (asc, desc)
    """
    try:
        # SheetDB API가 설정되지 않은 경우
        if not SHEETDB_API_ID:
            # 테스트용 데이터 반환
            return [
                {
                    "email": "test@example.com",
                    "name": "테스트 사용자",
                    "phoneNo": "01012345678",
                    "courseName": "테스트 코스",
                    "pageVariant": "a",
                    "utmSource": "test",
                    "utmMedium": "test",
                    "utmCampaign": "test",
                    "utmTerm": "test",
                    "utmContent": "test",
                    "submitAt": "2025-05-18 12:00:00"
                },
                {
                    "email": "sample@example.com",
                    "name": "샘플 사용자",
                    "phoneNo": "01098765432",
                    "courseName": "샘플 코스",
                    "pageVariant": "b",
                    "utmSource": "sample",
                    "utmMedium": "sample",
                    "utmCampaign": "sample",
                    "utmTerm": "sample",
                    "utmContent": "sample",
                    "submitAt": "2025-05-17 15:30:00"
                }
            ]
        
        # 쿼리 파라미터 구성
        params = {}
        if limit is not None:
            params["limit"] = limit
        if offset is not None:
            params["offset"] = offset
        if sort_by is not None:
            params["sort_by"] = sort_by
        if sort_order is not None:
            params["sort_order"] = sort_order
        
        # SheetDB API 호출
        response = requests.get(SHEETDB_BASE_URL, params=params)
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        
        # 응답 반환
        return response.json()
    except requests.RequestException as e:
        # API 호출 오류 처리
        raise HTTPException(status_code=500, detail=f"SheetDB API 호출 오류: {str(e)}")

# 실시간 데이터를 sampleData.json 파일에 저장하는 엔드포인트
@app.post("/api/save-data")
async def save_latest_data(request: DataSaveRequest):
    """
    제공된 데이터를 sampleData.json 파일에 저장하여 '최근 갱신 데이터'로 유지합니다.
    이를 통해 다음 방문 시 API 호출 없이 최근에 가져온 데이터를 사용할 수 있게 됩니다.
    사용자는 저장된 데이터를 확인하거나 필요할 때만 실시간 데이터를 새로 로드할 수 있습니다.
    """
    try:
        # sampleData.json 디렉토리가 없는 경우 생성
        os.makedirs(os.path.dirname(SAMPLE_DATA_PATH), exist_ok=True)
        
        # 데이터를 JSON 파일로 저장
        with open(SAMPLE_DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(request.data, f, ensure_ascii=False, indent=2)
            
        return {"success": True, "message": "데이터가 최근 갱신 데이터로 성공적으로 저장되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 저장 오류: {str(e)}")

# React 앱 정적 파일 경로 설정
# 1. 빌드된 버전 경로
build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/build")
# 2. 개발 버전 경로
public_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/public")

# 정적 파일 제공을 위한 경로 선택 (빌드 경로가 있으면 사용, 없으면 public 경로 사용)
if os.path.exists(build_path) and os.path.isdir(build_path):
    static_files_path = build_path
    print(f"React 빌드 디렉토리를 사용합니다: {build_path}")
    
    # build/static 경로가 있으면 /static 경로로 마운트
    static_folder = os.path.join(build_path, "static")
    if os.path.exists(static_folder) and os.path.isdir(static_folder):
        app.mount("/static", StaticFiles(directory=static_folder), name="static")
else:
    static_files_path = public_path
    print(f"React 개발 디렉토리를 사용합니다: {public_path}")

# 메인 HTML 또는 다른 정적 파일에 대한 요청 처리
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # API 요청이면 무시 (다른 라우트에서 처리됨)
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API 엔드포인트를 찾을 수 없습니다")
    
    # 빈 경로인 경우 index.html 제공
    if not full_path:
        index_path = os.path.join(static_files_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    
    # 특정 파일 요청인 경우 해당 파일 제공
    file_path = os.path.join(static_files_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # React 라우팅을 위해 존재하지 않는 경로의 경우 index.html 제공
    index_path = os.path.join(static_files_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # 파일이 존재하지 않는 경우 404 응답
    return JSONResponse(
        status_code=200,
        content={
            "message": "FastAPI 서버가 실행 중입니다. React 앱은 개발 서버에서 실행해주세요.",
            "development_mode": True,
            "instructions": "React 앱을 개발 모드로 실행하려면 'cd frontend && npm start'를 실행하세요.",
            "api_endpoints": [
                {"path": "/api/hello", "method": "GET", "description": "간단한 인사 메시지를 반환합니다."},
                {"path": "/api/sheet-data", "method": "GET", "description": "SheetDB 데이터를 가져옵니다."},
                {"path": "/api/save-data", "method": "POST", "description": "데이터를 sampleData.json 파일에 저장합니다."}
            ]
        }
    )

if __name__ == "__main__":
    # 환경 변수에서 서버 설정 로드
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    
    # 개발 서버 실행
    print(f"FastAPI 서버를 {host}:{port}에서 실행합니다. (디버그 모드: {debug})")
    if not SHEETDB_API_ID:
        print("경고: SHEETDB_API_ID가 설정되지 않았습니다. 테스트 데이터가 사용됩니다.")
    uvicorn.run("app:app", host=host, port=port, reload=debug) 