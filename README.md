# FastAPI + React + SheetDB 통합 프로젝트

이 프로젝트는 FastAPI 백엔드와 React 프론트엔드를 하나의 서버에서 실행하고, SheetDB API를 통해 Google 스프레드시트 데이터를 가져오는 예제입니다.

## 프로젝트 구조

```
project/
  ├── backend/        # FastAPI 서버
  │   ├── app.py      # FastAPI 애플리케이션
  │   └── requirements.txt
  └── frontend/       # React 앱
      └── src/
          └── components/
              ├── SheetDataTable.js     # SheetDB 데이터 테이블 컴포넌트
              └── SheetDataTable.css    # 테이블 컴포넌트 스타일
```

## SheetDB 설정

1. [SheetDB](https://sheetdb.io/) 계정을 생성합니다.
2. Google 스프레드시트를 연결하고 API ID를 얻습니다.
3. 백엔드 디렉토리에 `.env` 파일을 생성하고 다음과 같이 설정합니다:

```
SHEETDB_API_ID=your_api_id_here
PORT=5000
HOST=0.0.0.0
DEBUG=True
```

## 설치 및 실행 방법

### 1. 백엔드 설정

```bash
# 가상환경 생성 및 활성화 (선택사항)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# 필요한 패키지 설치
cd backend
pip install -r requirements.txt

# .env 파일 설정
# SHEETDB_API_ID=your_api_id_here 설정
```

### 2. 프론트엔드 설정

```bash
# 필요한 패키지 설치
cd frontend
npm install

# 프로덕션용 빌드 생성
npm run build
```

### 3. 애플리케이션 실행

#### 개발 모드

개발 모드에서는 FastAPI 서버와 React 개발 서버를 따로 실행합니다.

```bash
# 터미널 1: FastAPI 서버 실행
cd backend
python app.py  # http://localhost:5000 에서 실행됨

# 터미널 2: React 개발 서버 실행
cd frontend
npm start  # http://localhost:3000 에서 실행됨
```

이 모드에서는 React 앱이 package.json의 proxy 설정을 통해 FastAPI 서버로 API 요청을 전달합니다.

#### 프로덕션 모드

프로덕션 모드에서는 FastAPI 서버가 React 앱의 빌드 파일을 제공합니다.

```bash
# React 앱 빌드
cd frontend
npm run build

# FastAPI 서버 실행
cd backend
python app.py  # http://localhost:5000 에서 실행됨
```

브라우저에서 http://localhost:5000 으로 접속하면 FastAPI 서버가 React 앱을 제공합니다.

## 작동 방식

1. FastAPI는 백엔드 API를 `/api/*` 경로로 제공합니다.
2. SheetDB API를 통해 Google 스프레드시트 데이터를 가져옵니다.
3. React 앱은 이 API에 요청을 보내 데이터를 가져와 테이블 형태로 표시합니다.
4. 프로덕션 모드에서는 FastAPI가 React 빌드 파일을 정적 파일로 제공합니다.
5. FastAPI의 와일드카드 라우트(`/{full_path:path}`)가 React의 클라이언트 측 라우팅을 지원합니다.

## SheetDB API 사용법

SheetDB API는 Google 스프레드시트를 RESTful API로 변환하여 데이터에 쉽게 접근할 수 있도록 합니다.

### 데이터 읽기

```
GET /api/sheet-data
```

#### 옵션 파라미터:

- `limit`: 반환할 행 수 제한
- `offset`: 시작 위치 (건너뛸 결과 수)
- `sort_by`: 정렬할 열 이름
- `sort_order`: 정렬 순서 (asc, desc)

## FastAPI의 장점

- **빠른 성능**: FastAPI는 Starlette와 Pydantic을 기반으로 하며, 매우 높은 성능을 제공합니다.
- **자동 문서화**: OpenAPI와 JSON Schema를 기반으로 한 자동 API 문서 생성 기능을 제공합니다.
- **타입 힌트**: Python 타입 힌트를 활용하여 데이터 유효성 검사와 자동 문서화를 지원합니다.
- **비동기 지원**: `async`/`await` 문법을 지원하여 높은 동시성을 가능하게 합니다.
- **개발자 경험**: 코드 편집기 지원, 자동 완성, 타입 검사 등으로 더 나은 개발자 경험을 제공합니다. 