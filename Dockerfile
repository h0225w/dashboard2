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