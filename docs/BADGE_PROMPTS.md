# 업적 뱃지 이미지 프롬프트 (ChatGPT 이미지 생성용)

> `npm run docs:badges`로 `src/game/achievements.ts`에서 자동으로 만든다. 업적을 고치면 다시 실행.

## 쓰는 법

1. 아래 프롬프트를 하나씩 ChatGPT에 넣어 이미지를 만든다. 같은 대화창에서 이어서 만들면 그림체가 더 잘 맞는다.
   - 처음 하나를 만든 뒤 "이 스타일 그대로 다음 뱃지도 만들어 줘"라고 덧붙이면 세트 느낌이 유지된다.
2. 배경은 **투명(PNG)** 으로 받는다. 안 되면 단색 배경도 괜찮다(변환 스크립트가 바깥 배경을 지운다).
3. 파일 이름을 각 제목 옆 경로대로 저장한다: `img/badges/<업적 id>.png`
4. `npm run assets:badges` 실행 → `src/assets/badges/<id>.webp` 로 변환되어 게임에 바로 나온다.

## 공통 스타일

- 귀여운 2등신 픽셀아트 느낌 (게임의 판사 캐릭터와 같은 톤), 글자·숫자 없음
- 메달·테두리 없이 그림만. 모양은 자유지만 1:1 정사각형 안에 다 들어와야 함 (꽉 채울 필요는 없고, 가장자리에 닿거나 잘리면 안 됨)
- 반짝이·광채 같은 덧붙인 장식 없음 (설명에 있는 것만 그림)
- 색감으로 성격 구분: 좋음 = 금빛, 중립 = 은빛·회청색, 나쁨 = 칙칙한 청동·붉은빛 + 금 간 자국

## 프롬프트 (48개)

### 1. 첫 단추 — `img/badges/first-hit.png`

- 조건: 첫 판결 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small whole black judge robe shown on its own like a floating garment icon, with a single shiny gold button just fastened at the top collar, the other buttonholes below still empty.
```

### 2. 명판관 — `img/badges/streak-5.png`

- 조건: 5연속 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a wooden judge gavel resting diagonally, with five small golden stars in a gentle rising arc above it, each star slightly bigger and brighter than the one before, like a combo streak lighting up.
```

### 3. 신들린 판결 — `img/badges/streak-10.png`

- 조건: 10연속 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge in a black robe with eyes calmly closed in deep focus, confidently striking a golden gavel down onto a sound block with one hand, bold motion lines behind the gavel.
```

### 4. 형사 전문가 — `img/badges/criminal-20.png`

- 조건: 형사 사건 20건 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a single pair of steel handcuffs lying half open, with a small golden key inserted in one cuff.
```

### 5. 민사의 달인 — `img/badges/civil-15.png`

- 조건: 민사 사건 15건 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small folded paper IOU note with a red thumbprint mark, tucked half inside a plump white money envelope.
```

### 6. 난제 해결사 — `img/badges/hard-10.png`

- 조건: 가장 어려운 사건 10건 적중
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small magnifying glass hovering over the final golden jigsaw puzzle piece clicking into place in an almost finished puzzle square.
```

### 7. 무죄 추정 — `img/badges/acquittal-3.png`

- 조건: 무죄 사건을 3번 무죄로 판결
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a white dove flying out of an open birdcage.
```

### 8. 엇나간 감 — `img/badges/miss-5.png`

- 조건: 5연속 미적중
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a small round dartboard with three darts all stuck outside the rim, none near the center.
```

### 9. 판사님 그건 좀 — `img/badges/jailed-innocent.png`

- 조건: 무죄 사건에 3번 실형 선고
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a small white dove sitting sadly behind iron jail bars, with a single droplet of a tear on its cheek.
```

### 10. 철퇴 판사 — `img/badges/too-harsh.png`

- 조건: 실제 판결보다 무겁게 10번 선고
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a wooden gavel with an oversized heavy iron head, just slammed down onto a sound block that has cracked in half, with bold impact lines.
```

### 11. 솜방망이 — `img/badges/too-soft.png`

- 조건: 실제 판결보다 가볍게 10번 선고
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a wooden gavel whose head is a puffy white cotton ball, softly squishing as it touches a sound block.
```

### 12. 기각 전문 — `img/badges/dismiss-5.png`

- 조건: 민사에서 5번 잘못 청구 기각
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a small metal wastebasket overflowing with crumpled paper documents, one crumpled sheet fallen on the floor beside it.
```

### 13. 새 명패 — `img/badges/first-promotion.png`

- 조건: 첫 진급
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a wooden desk name plate with a brand new shiny gold trim, a small red ribbon bow tied on one corner.
```

### 14. 탄탄대로 — `img/badges/smooth-road.png`

- 조건: 강등 없이 대법관 도달
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a long straight red carpet rolled out without a single wrinkle, leading to the front steps of a small courthouse.
```

### 15. 초고속 승진 — `img/badges/fast-track.png`

- 조건: 45세 이전 대법관 도달
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge character wearing a black judge robe like a superhero cape, flying straight vertically upward with one fist raised overhead, the robe fluttering behind, bold vertical speed lines below.
```

### 16. 파격 인사 — `img/badges/double-promotion.png`

- 조건: 2계급 특진
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: the collar of a black judge robe with two shiny gold rank pins being pinned on at once, side by side.
```

### 17. 사법부의 수장 — `img/badges/chief-justice.png`

- 조건: 대법원장 취임
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small grand courthouse building with white columns, golden trim on its triangular roof, and wide front steps.
```

### 18. 최연소 대법원장 — `img/badges/youngest-chief.png`

- 조건: 45세 이하에 대법원장 취임
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a younger kid-faced chibi judge character with a black judge robe worn like a superhero cape, just landing on top of a small golden high-backed chair, cape still fluttering, a small golden crown on the head.
```

### 19. 닳고 닳은 봉 — `img/badges/verdicts-100.png`

- 조건: 100건 판결
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a well-worn wooden gavel with a smooth polished handle, resting on a sound block with a deep dent worn into its center from countless strikes.
```

### 20. 이게 아닌데 — `img/badges/first-demotion.png`

- 조건: 첫 강등
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a wooden desk name plate fallen face-down on the floor with a crack running through it.
```

### 21. 칠전팔기 — `img/badges/comeback.png`

- 조건: 3번 강등 겪고 최고 직급 되찾기
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a round-bottomed roly-poly tumbler toy shaped like a chibi judge in a black robe, swaying back upright after being tipped over, with small curved rocking lines at its base.
```

### 22. 쳇바퀴 인사 — `img/badges/revolving-door.png`

- 조건: 같은 직급에서 강등과 재진급 3번 반복
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a chibi judge character in a black robe running hard inside a small hamster exercise wheel, sweating with a tired face, with circular motion lines around the wheel.
```

### 23. 만년 배석 — `img/badges/forever-associate.png`

- 조건: 진급 없이 배석판사로 5년 근무
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a plain wooden desk name plate covered in thick dust and draped with cobwebs, a tiny spider hanging from one corner.
```

### 24. 정년 퇴임 — `img/badges/retired.png`

- 조건: 대법원장이 되지 못한 채 정년 퇴임
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a black judge robe neatly draped over the back of an empty wooden chair, a small farewell flower bouquet resting on the seat.
```

### 25. 다시 보니 — `img/badges/insight-1.png`

- 조건: 통찰력으로 판결 1번 다시 고르기
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge character in a black robe pushing up round glasses with one finger while taking a second closer look at a case file held in the other hand.
```

### 26. 꿰뚫어 보는 눈 — `img/badges/insight-10.png`

- 조건: 통찰력으로 판결 10번 다시 고르기
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small hawk wearing a tiny black judge cap, perched on a stack of case files and staring down at them with sharp focused eyes.
```

### 27. 인맥 찬스 — `img/badges/shield-1.png`

- 조건: 인맥 덕분에 1번 강등 면하기
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a smartphone showing an incoming call screen with a blank contact silhouette, a single small blank business card leaning against it.
```

### 28. 든든한 뒷배 — `img/badges/shield-5.png`

- 조건: 인맥 덕분에 5번 강등 면하기
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a thick bulging business card holder book stuffed with so many blank business cards that they are sticking out on every side.
```

### 29. 좋은 평판 — `img/badges/early-promotion.png`

- 조건: 평판 덕분에 1번 조기 진급
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small round bird wearing a tiny black judge cap, holding a golden promotion envelope in its beak, perched on a branch with a sun just starting to peek over the horizon.
```

### 30. 자자한 명성 — `img/badges/early-promotion-3.png`

- 조건: 평판 덕분에 3번 조기 진급
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: three small round birds wearing tiny black judge caps, perched in a row on a branch, each holding a golden promotion envelope in its beak, a sun just peeking over the horizon.
```

### 31. 철인 — `img/badges/health-100.png`

- 조건: 건강 100 달성
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge character in a black robe with sleeves rolled up, lifting a dumbbell high with one hand and flexing proudly.
```

### 32. 마당발 — `img/badges/network-100.png`

- 조건: 인맥 100 달성
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a small photo frame showing a crowded group photo, a chibi judge in a black robe in the very center making a peace sign, many smiling people squeezed in around it.
```

### 33. 국민 판사 — `img/badges/reputation-100.png`

- 조건: 평판 100 달성
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a folded newspaper front page with a large smiling portrait drawing of a chibi judge, the headline area shown as thick blank lines.
```

### 34. 카페인 중독 — `img/badges/overwork.png`

- 조건: 건강 35 이하로 떨어지기
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a chibi judge character in a black robe with heavy dark eye bags, half buried behind tall piles of case files, clutching a coffee mug with a tired blank stare.
```

### 35. 번아웃 — `img/badges/burnout.png`

- 조건: 건강 40 미만인 채로 10건 판결
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a chibi judge character in a black robe melted and slumped limply over a chair like a puddle, with a dazed face.
```

### 36. 바닥난 평판 — `img/badges/bad-reputation.png`

- 조건: 평판 20 미만
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a chibi judge character in a black robe shielding its face with one sleeve, a squashed tomato splattered on the robe and another tomato flying toward it.
```

### 37. 청렴 판사 — `img/badges/clean-10.png`

- 조건: 유혹 제안 10번 거절
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge character in a black robe firmly pushing back a cardboard apple box with both hands, shaking its head, a thick envelope peeking out from between the apples.
```

### 38. 여의도 안가요 — `img/badges/no-politics.png`

- 조건: 한 판에서 정치권 제안 3가지 모두 거절
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a small open gift box holding a shiny round gold lapel pin, with a red return arrow sticker on the lid, being pushed back.
```

### 39. 사과 박스 — `img/badges/first-bribe.png`

- 조건: 유혹 제안 첫 수락
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a cardboard apple box with its lid half open, shiny red apples on top and a thick envelope peeking out from between the apples.
```

### 40. 단골 기삿거리 — `img/badges/exposed-3.png`

- 조건: 유혹 제안 수락이 3번 들통나기
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a startled chibi judge character in a black robe caught in the middle, surrounded by several cameras with long telephoto lenses aimed at it from all sides, bold camera flash bursts going off.
```

### 41. 사법 농단 — `img/badges/judicial-abuse.png`

- 조건: 유혹 제안 5번 수락하고 대법관 되기
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: a wooden judge gavel hanging from puppet strings like a marionette, the strings leading up to a large hand at the top controlling them with its fingers.
```

### 42. 완전 범죄 — `img/badges/lucky.png`

- 조건: 유혹 제안 5번 수락하고 한 번도 안 들키기
- 성격: 나쁨 (칙칙한 청동·붉은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood. Subject: several cameras all aimed the wrong way, while a chibi judge character in a black robe tiptoes sneakily behind them carrying an envelope.
```

### 43. 거절의 달인 — `img/badges/decliner.png`

- 조건: 기습 일정 10번 거절
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a chibi judge character in a black robe smiling apologetically while waving both hands in front of it in a polite no-thank-you gesture.
```

### 44. 예스맨 — `img/badges/yes-man.png`

- 조건: 기습 일정 10번 연속 참여
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a chibi judge character in a black robe eagerly stretching one hand as high as it can go, standing on tiptoes, with an excited face.
```

### 45. 공부벌레 — `img/badges/bookworm.png`

- 조건: 통찰력 활동 10번
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a chibi judge character in a black robe sitting between tall stacks of law books, rubbing its eyes while reading by a small desk lamp.
```

### 46. 사교의 왕 — `img/badges/social.png`

- 조건: 인맥 활동 10번
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a chibi judge character in a black robe wearing a golf visor, mid-swing with a golf club, a small golf ball flying off, surrounded by a few other chibi golfers in visors clapping and cheering.
```

### 47. 시민의 판사 — `img/badges/volunteer.png`

- 조건: 평판 활동 10번
- 성격: 좋음 (금빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Bright golden accents, cheerful mood. Subject: a chibi judge character in a black robe wearing cotton work gloves, cheerfully carrying a stack of black coal briquettes.
```

### 48. 휴정 중 — `img/badges/rest-10.png`

- 조건: 건강 활동 10번
- 성격: 중립 (은빛)

```
Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays. Cool silver and soft gray-blue accents, calm mood. Subject: a chibi judge character asleep in a hammock strung between two small trees, its black robe draped over it like a blanket.
```
