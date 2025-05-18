# Next Level 마케팅 대시보드 배포 가이드

이 문서는 Next Level 마케팅 대시보드를 프로덕션 환경에 배포하기 위한 단계를 설명합니다.

## 사전 요구사항

- Python 3.8 이상
- Node.js 14 이상
- pip (Python 패키지 관리자)
- npm (Node.js 패키지 관리자)

## 1. 환경 변수 설정

### 백엔드 환경 변수

백엔드 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```
# SheetDB API 연동 키 (실제 API 키로 변경 필요)
SHEETDB_API_ID=your_sheetdb_api_id

# 서버 설정
PORT=5000
HOST=0.0.0.0

# 프로덕션 모드 활성화
PRODUCTION=true
```

## 2. 프론트엔드 빌드

프론트엔드 애플리케이션 빌드:

```bash
cd frontend
npm install
npm run build
cd ..
```

## 3. 백엔드 설정

백엔드 의존성 설치:

```bash
cd backend
pip install -r requirements.txt
cd ..
```

## 4. 서버 실행

프로덕션 모드로 서버 실행:

```bash
python run.py
```

서버가 시작되면 `http://[서버_IP]:5000`에서 대시보드에 접근할 수 있습니다.

## 5. 서버 배포 옵션

### 5.1 Docker 배포

Docker를 사용하여 배포하려면 다음 Dockerfile을 사용하세요:

```dockerfile
FROM node:16 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim
WORKDIR /app

# 백엔드 요구사항 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ ./backend/
COPY run.py .

# 빌드된 프론트엔드 복사
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 포트 노출
EXPOSE 5000

# 환경 변수 설정
ENV PRODUCTION=true
ENV PORT=5000
ENV HOST=0.0.0.0

# 서버 실행
CMD ["python", "run.py"]
```

Docker 컨테이너를 빌드하고 실행:

```bash
docker build -t nextlevel-dashboard .
docker run -p 5000:5000 --env-file ./backend/.env nextlevel-dashboard
```

### 5.2 PM2를 사용한 배포 (리눅스)

PM2를 사용하여 프로세스 관리:

```bash
npm install -g pm2
pm2 start run.py --name "nextlevel" --interpreter python
pm2 save
pm2 startup
```

### 5.3 Windows 서비스로 배포

NSSM(Non-Sucking Service Manager)을 사용하여 Windows 서비스로 실행:

1. [NSSM](https://nssm.cc/download)을 다운로드합니다.
2. 다음 명령을 실행합니다:

```cmd
nssm install NextLevelDashboard python.exe D:\path\to\your\dashboard\run.py
nssm set NextLevelDashboard AppDirectory D:\path\to\your\dashboard
nssm set NextLevelDashboard DisplayName "Next Level Dashboard"
nssm set NextLevelDashboard Description "마케팅 대시보드 서비스"
nssm start NextLevelDashboard
```

## 6. 유지보수 및 업데이트

### 업데이트 배포

코드 업데이트 후 배포 과정:

1. 최신 코드를 받습니다: `git pull`
2. 프론트엔드를 다시 빌드합니다: `cd frontend && npm run build`
3. 서버를 재시작합니다: `python run.py`

## 7. 문제해결

일반적인 문제 해결 방법:

- **서버 연결 오류**: 방화벽 설정을 확인하고 포트 5000이 열려 있는지 확인
- **화면이 보이지 않음**: 프론트엔드 빌드가 제대로 되었는지 확인
- **데이터 로드 실패**: SheetDB API 키 설정 확인

---

추가 질문이나 문제가 있으면 개발팀에 문의하세요. 