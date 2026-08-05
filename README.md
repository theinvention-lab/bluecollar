블루컬러 라이프스타일 오픈이노베이션 1기 랜딩페이지 V4

1. index.html이 있는 폴더를 웹서버에 올리면 페이지를 확인할 수 있습니다.
2. 이미지 교체: assets/hero-forklifts.png
3. 모집 일정·접수 링크: index.html의 APPLY NOW 섹션에서 수정
4. 키 컬러: styles.css 최상단 :root 변수에서 수정
5. 브랜드 필름: script.js의 films 배열에서 videoId와 제목을 수정
6. 운영기관 로고: index.html의 #partners 섹션 내 SVG를 정식 CI 파일로 교체 가능
7. 담당 이메일: business@roailab.com

[V4 반영사항]
- YouTube iframe 도메인을 youtube-nocookie.com으로 변경
- 문서 전체에 strict-origin-when-cross-origin Referrer Policy 적용
- HTTP·HTTPS 배포 환경에서는 현재 도메인을 origin 파라미터로 자동 전달
- 좌우 버튼으로 두 편의 브랜드 필름 전환
- 영상별 'YouTube에서 보기' 대체 링크를 함께 제공
- 영상 전환 시 iframe, 제목, 번호, 외부 링크가 함께 변경

[오류 153 방지 및 로컬 확인]
YouTube 오류 153은 file://로 HTML을 직접 열어 Referer가 전달되지 않을 때 발생할 수 있습니다.
HTML 파일을 더블클릭하지 말고 아래 방식으로 localhost에서 확인하십시오.

Windows PowerShell 또는 명령 프롬프트:
1) index.html이 있는 폴더에서 터미널 열기
2) py -m http.server 8000
   py 명령이 없으면: python -m http.server 8000
3) 브라우저에서 http://localhost:8000/ 접속

정식 배포 시에는 HTTPS 환경을 권장합니다. Vercel, Netlify, GitHub Pages 또는 기존 홈페이지 서버에 올릴 수 있습니다.
브라우저·네트워크 정책으로 영상이 차단되는 경우에는 플레이어 하단의 'YouTube에서 보기' 링크를 이용할 수 있습니다.

[배포 참고]
- 모집 기간과 지원 접수 링크는 확정 후 반영해야 합니다.
- 투자 규모와 목표 지분율은 투자심사 및 계약 협의에 따라 달라질 수 있습니다.
