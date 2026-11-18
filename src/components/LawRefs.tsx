import { lawLink } from '../game/lawLink';

/** 관련 조문 목록: 조문마다 국가법령정보센터 링크 (새 탭) */
export default function LawRefs({ refs }: { refs: string[] }) {
  if (refs.length === 0) return null;
  return (
    <p className="law-refs">
      관련 조문:{' '}
      {refs.map((r, i) => {
        const href = lawLink(r);
        return (
          <span key={r}>
            {i > 0 && ', '}
            {href ? (
              <a href={href} target="_blank" rel="noreferrer">
                {r}
              </a>
            ) : (
              r
            )}
          </span>
        );
      })}
    </p>
  );
}
