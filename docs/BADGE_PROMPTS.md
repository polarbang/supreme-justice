# 업적 뱃지 이미지 프롬프트 (ChatGPT 이미지 생성용)

> `npm run docs:badges`로 `src/game/achievements.ts`에서 자동으로 만든다. 업적을 고치면 다시 실행.

## 쓰는 법

1. 아래 프롬프트를 하나씩 ChatGPT에 넣어 이미지를 만든다. 같은 대화창에서 이어서 만들면 그림체가 더 잘 맞는다.
   - 처음 하나를 만든 뒤 "이 스타일 그대로 다음 뱃지도 만들어 줘"라고 덧붙이면 세트 느낌이 유지된다.
2. 배경은 **투명(PNG)** 으로 받는다. 안 되면 단색 배경도 괜찮다(변환 스크립트가 바깥 배경을 지운다).
3. 파일 이름을 각 제목 옆 경로대로 저장한다: `img/badges/<업적 id>.png`
4. `npm run assets:badges` 실행 → `src/assets/badges/<id>.webp` 로 변환되어 게임에 바로 나온다.

## 공통 스타일

- 귀여운 2등신 픽셀아트 느낌 (게임의 판사 캐릭터와 같은 톤), 둥근 메달 모양, 글자·숫자 없음
- 테두리 색으로 성격 구분: 좋음 = 금테, 중립 = 은테, 나쁨 = 금이 간 짙은 청동테 + 붉은 바탕

## 프롬프트 (45개)

### 1. 첫 단추 — `img/badges/first-hit.png`

- 조건: 첫 판결 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a single shirt button being fastened on a black judge robe.
```

### 2. 명판관 — `img/badges/streak-5.png`

- 조건: 5연속 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a golden gavel with five small stars in an arc above it.
```

### 3. 신들린 판결 — `img/badges/streak-10.png`

- 조건: 10연속 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a glowing golden gavel surrounded by radiant light rays and sparkles.
```

### 4. 형사 전문가 — `img/badges/criminal-20.png`

- 조건: 형사 사건 20건 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a pair of handcuffs crossed with a gavel.
```

### 5. 민사의 달인 — `img/badges/civil-15.png`

- 조건: 민사 사건 15건 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a signed contract scroll with a red seal stamp and a fountain pen.
```

### 6. 난제 해결사 — `img/badges/hard-10.png`

- 조건: 난이도 3 사건 10건 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a tangled knot of rope being cleanly untied, with a small key.
```

### 7. 무죄 추정 — `img/badges/acquittal-3.png`

- 조건: 정답이 "무죄"인 사건 3건 적중
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a white dove flying out of an open birdcage.
```

### 8. 엇나간 감 — `img/badges/miss-5.png`

- 조건: 5연속 미적중
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a compass with a spinning broken needle pointing the wrong way.
```

### 9. 판사님 그건 좀… — `img/badges/jailed-innocent.png`

- 조건: 정답이 무죄인데 실형을 고른 것 3번
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a sweating judge face emoji next to cracked jail bars.
```

### 10. 철퇴 판사 — `img/badges/too-harsh.png`

- 조건: 실제보다 무거운 쪽을 고른 오답 10번
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a heavy iron mace smashing down, with impact lines.
```

### 11. 솜방망이 — `img/badges/too-soft.png`

- 조건: 실제보다 가벼운 쪽을 고른 오답 10번
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a fluffy cotton-candy club, soft and pink.
```

### 12. 기각 전문 — `img/badges/dismiss-5.png`

- 조건: 민사에서 "청구 기각"을 골라 틀린 것 5번
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a big red rejection stamp hitting a document.
```

### 13. 첫 발령 — `img/badges/first-promotion.png`

- 조건: 첫 진급
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: an official appointment letter with a ribbon and a gold seal.
```

### 14. 탄탄대로 — `img/badges/smooth-road.png`

- 조건: 강등 없이 대법관 도달
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a straight golden road leading up to a courthouse on a hill.
```

### 15. 초고속 승진 — `img/badges/fast-track.png`

- 조건: 45세 이전 대법관 도달
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a rocket shooting upward past stair steps.
```

### 16. 파격 인사 — `img/badges/double-promotion.png`

- 조건: 2계급 특진
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a person leaping over two steps at once on a staircase, with motion lines.
```

### 17. 사법부의 수장 — `img/badges/chief-justice.png`

- 조건: 대법원장 취임
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a golden crown resting on top of a gavel and scales of justice.
```

### 18. 최연소 대법원장 — `img/badges/youngest-chief.png`

- 조건: 45세 이하에 대법원장 취임
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a small sprout growing out of a golden crown.
```

### 19. 개근상 — `img/badges/verdicts-100.png`

- 조건: 판결 100건
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a tall stack of case files with a 100 ribbon.
```

### 20. 첫 좌천 — `img/badges/first-demotion.png`

- 조건: 첫 강등
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a downward arrow on a cracked name plate.
```

### 21. 칠전팔기 — `img/badges/comeback.png`

- 조건: 강등 3번 겪고 다시 가장 높았던 직급 회복
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a roly-poly tumbler doll standing back up.
```

### 22. 회전문 인사 — `img/badges/revolving-door.png`

- 조건: 같은 직급에서 강등·재진급 3번 반복
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a spinning revolving door with circular arrows.
```

### 23. 만년 단독 — `img/badges/forever-single.png`

- 조건: 단독판사로 10년 이상 근무 (판결 40건)
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a dusty desk name plate with cobwebs and a calendar with many torn pages.
```

### 24. 정년 퇴임 — `img/badges/retired.png`

- 조건: 대법원장이 되지 못하고 60세 퇴임
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a judge robe hanging on a coat hook with a farewell flower bouquet.
```

### 25. 꿰뚫어 보는 눈 — `img/badges/insight-10.png`

- 조건: 통찰력으로 다시 고르기 10번
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a sharp glowing eye inside a magnifying glass.
```

### 26. 든든한 뒷배 — `img/badges/shield-3.png`

- 조건: 인맥으로 강등 면제 3번
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a sturdy shield held up by several hands from behind.
```

### 27. 좋은 평판 — `img/badges/early-promotion.png`

- 조건: 평판으로 조기 진급 1번
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a thumbs-up inside a laurel wreath.
```

### 28. 철인 — `img/badges/health-100.png`

- 조건: 건강 100 달성
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a flexed muscular arm with a heart.
```

### 29. 마당발 — `img/badges/network-100.png`

- 조건: 인맥 100 달성
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a big foot surrounded by many small connected people icons.
```

### 30. 국민 판사 — `img/badges/reputation-100.png`

- 조건: 평판 100 달성
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a crowd of tiny people cheering under a heart.
```

### 31. 과로 판사 — `img/badges/overwork.png`

- 조건: 건강 35 이하로 떨어짐
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a tired face with dark eye bags next to a steaming coffee cup and a pile of papers.
```

### 32. 번아웃 — `img/badges/burnout.png`

- 조건: 건강 40 미만 상태에서 판결 누적 10건
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a burnt-out match with a thin wisp of smoke.
```

### 33. 바닥난 평판 — `img/badges/bad-reputation.png`

- 조건: 평판 20 미만
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a newspaper with a big red headline and a downward graph.
```

### 34. 청렴 판사 — `img/badges/clean-10.png`

- 조건: 유혹 제안 10번 거절
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a hand pushing away an envelope of money, with a white lily.
```

### 35. 정치와 거리 두기 — `img/badges/no-politics.png`

- 조건: 정당 영입·입각 타진·정치권 회동 제안을 받은 적이 있고 모두 거절
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: a judge gavel standing apart from a parliament building, with a line between them.
```

### 36. 첫 청탁 — `img/badges/first-bribe.png`

- 조건: 유혹 제안 첫 수락
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a hand secretly taking an envelope under a table.
```

### 37. 단골 기삿거리 — `img/badges/exposed-3.png`

- 조건: 들통 3번
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: camera flashes and a microphone pointed at a newspaper headline.
```

### 38. 사법 농단 — `img/badges/judicial-abuse.png`

- 조건: 유혹 제안 5번 수락하고 대법관 이상 도달
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a cracked scale of justice tilted by a bag of gold coins.
```

### 39. 운 좋은 사람 — `img/badges/lucky.png`

- 조건: 유혹 제안 5번 수락했는데 한 번도 안 들킴
- 성격: 나쁨 (붉은 테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Dark bronze rim with small cracks, deep red inner disc, slightly comical gloomy mood. Inside the badge: a four-leaf clover hiding behind a sneaky grin mask.
```

### 40. 거절의 달인 — `img/badges/decliner.png`

- 조건: 일반 기습 일정 10번 거절
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a polite hand raised in a stop gesture, with a calendar.
```

### 41. 예스맨 — `img/badges/yes-man.png`

- 조건: 일반 기습 일정 10번 연속 참여
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a bobblehead nodding yes with a big speech bubble saying OK.
```

### 42. 공부벌레 — `img/badges/bookworm.png`

- 조건: 통찰력 활동 10번
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a cute worm wearing glasses peeking out of a thick law book.
```

### 43. 사교의 왕 — `img/badges/social.png`

- 조건: 인맥 활동 10번
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: two clinking glasses with a small crown above them.
```

### 44. 봉사하는 판사 — `img/badges/volunteer.png`

- 조건: 평판 활동 10번
- 성격: 좋음 (금테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Polished gold rim with a laurel pattern, warm cream inner disc, cheerful mood. Inside the badge: two hands holding a warm glowing heart.
```

### 45. 쉬어 가기 — `img/badges/rest-10.png`

- 조건: 건강 활동 10번
- 성격: 중립 (은테)

```
Cute chibi pixel-art style game achievement badge, matching a Korean courtroom game with chibi judges in black robes. A single round medal badge centered, thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image, the badge fills about 85% of the frame. Silver rim with a simple pattern, light gray-blue inner disc, calm mood. Inside the badge: a hammock between two trees with a sleeping cat.
```
