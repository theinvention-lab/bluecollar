BLUE-COLLAR OPEN INNOVATION WEBSITE · V10

GitHub Pages 업로드
1. 이 폴더 안의 파일 전체를 GitHub 저장소 최상단(root)에 업로드합니다.
2. Settings → Pages → Deploy from a branch → main / root를 선택합니다.
3. index.html과 case-study.html이 저장소 최상단에 있어야 합니다.

페이지
- index.html: 프로그램 Home
- case-study.html: Case Study 아카이브

콘텐츠 관리
- 사례 추가/수정: cases-data.js
- Home 대표 사례: 글로벌 대기업·국내 스타트업·해외 스타트업에서 각 1건을 자동 노출
- 공통 UI 보정: site-v10.css

영상
- YouTube는 youtube-nocookie.com, strict-origin-when-cross-origin, 현재 origin 자동 전달을 사용합니다.
- file:// 직접 실행보다 GitHub Pages 또는 localhost 환경에서 확인하는 것이 안전합니다.

로고
- 외부 로고가 정상 로딩될 때만 이미지가 표시됩니다.
- 로딩 실패 시 기업명 텍스트가 표시되어 카드 레이아웃이 깨지지 않습니다.
- 최종 공개 전 정식 CI 파일을 assets/logos에 저장하고 cases-data.js 경로를 교체하는 방식을 권장합니다.

문의 이메일
business@roailab.com
