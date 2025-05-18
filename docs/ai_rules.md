# 컴포넌트 생성: ShadCN 우선 사용
모든 UI 컴포넌트는 ShadCN을 우선으로 생성하세요.
ShadCN 컴포넌트 생성 CLI 명령어는 npx shadcn@latest add입니다.
Toast 관련 컴포넌트는 다음 위치에 있습니다:
components/ui/toast.tsx      # Toast 기본 컴포넌트
components/ui/toaster.tsx    # Toast 컨테이너 컴포넌트
hooks/use-toast.ts   # Toast 커스텀 훅

# Git 커밋 메시지 작성 규칙
포맷:
<type>: <subject>

<body>
커밋 타입 (Type):

feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
refactor: 코드 리팩토링
test: 테스트 코드, 리팩토링 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 수정
제목 (Subject):

변경 사항에 대한 간단한 설명
50자 이내로 작성
마침표 없이 작성
현재 시제 사용
본문 (Body):

변경 사항에 대한 자세한 설명
어떻게 보다는 무엇을, 왜 변경했는지 설명
여러 줄의 메시지를 작성할 땐 "-"로 구분
예시:

feat: 로그인 화면 키보드 UX 개선
- TextInput ref를 사용하여 자동 포커스 기능 추가
- returnKeyType 설정으로 키보드 엔터키 동작 개선
- 전화번호 입력 후 자동으로 비밀번호 입력창으로 포커스 이동
- 비밀번호 입력 후 엔터키로 로그인 가능하도록 개선