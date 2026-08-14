# SEO / GEO Implementation Notes

## Current production URL
- https://www.bluecollaroi.com/
- Canonical, Open Graph, sitemap and robots.txt are configured for this URL.
- If a custom domain is connected later, update all canonical/og:url/schema/sitemap base URLs.

## Implemented
- Unique title and meta description for Home and Case Study
- Canonical URLs
- robots meta with large image/snippet previews allowed
- Open Graph / Twitter Card metadata
- favicon and hero-image preload
- JSON-LD: WebSite, WebPage, Service, Organization, CollectionPage, ItemList, BreadcrumbList
- robots.txt with OAI-SearchBot access
- sitemap.xml
- Case Study cards pre-rendered into HTML so important case content is crawlable even before JavaScript runs; filtering/modal behavior remains JS-driven

## Keyword / entity map
### Home
- 블루칼라 오픈이노베이션
- 산업현장 스타트업
- MRO 스타트업
- 중장비 오픈이노베이션
- 산업현장 판로개척
- LIPS 투자
- 중장비선수들
- 더인벤션랩

### Case Study
- 산업현장 스타트업 사례
- MRO 사례
- 워크웨어 브랜드 사례
- 산업안전 스타트업
- 렌탈 스타트업
- 순환경제 스타트업
- 건설조달 / 현장 DX 사례

## GEO principles
- Keep key claims in visible HTML, not only images.
- Use concise headings and factual descriptions that can be quoted without context loss.
- Maintain official-site and article links on Case Study entries.
- Avoid unsupported superlatives or inferred claims.
- Keep organization names, program name, investment terms and schedule consistent across pages.
- No special AI-only markup is required; standard crawlability, structured data, textual content and source clarity are the foundation.

## Next high-impact step
The Case Study currently uses one collection URL plus hash-based modals. Hash fragments are not independent indexable pages. As the archive grows, generate a permanent URL per case (example: /case-study/linkflow/) with its own title, description, canonical, Organization/Article schema and source links. This will materially improve long-tail SEO and AI citation granularity.

## After deployment
1. Register the site in Google Search Console and submit sitemap.xml.
2. Register in Bing Webmaster Tools and Naver Search Advisor.
3. Request indexing for Home and Case Study after major updates.
4. Track organic/search referral traffic and ChatGPT referral traffic (utm_source=chatgpt.com when present).
5. Optional: automate IndexNow on GitHub pushes once a stable publishing workflow is established.


## Custom domain
- Primary canonical origin: https://www.bluecollaroi.com/
- GitHub Pages CNAME: www.bluecollaroi.com
- 기존 GitHub Pages URL은 canonical 대상으로 사용하지 않음.
