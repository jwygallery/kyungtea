import React from 'react';
import { AboutArticle } from '../types/cms';
import { HerbariumImage } from './HerbariumImage';

interface AboutViewProps {
  about: AboutArticle;
}

export const AboutView: React.FC<AboutViewProps> = ({ about }) => {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="border-b border-[#141413] pb-8">
        <h1
          className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl"
          style={{ textWrap: 'balance' }}
        >
          {about.title}
        </h1>
      </header>

      <div className="mt-10 space-y-10">
        {about.blocks.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm text-[#6E706E]">
            등록된 아티클 블록이 없습니다.
          </div>
        ) : (
          about.blocks.map((block, index) => {
            const blockNumber = String(index + 1).padStart(2, '0');

            if (block.type === 'image') {
              return (
                <div key={block.id}>
                  <HerbariumImage
                    src={block.content}
                    alt={block.caption || `kyung about visual ${blockNumber}`}
                    caption={block.caption}
                    aspectClass="aspect-[16/10]"
                    specimenCode={`PLATE ${blockNumber}`}
                  />
                </div>
              );
            }

            return (
              <div
                key={block.id}
                className="space-y-5 text-base leading-relaxed text-[#141413]"
              >
                {block.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line leading-[1.85]">
                    {para}
                  </p>
                ))}
              </div>
            );
          })
        )}
      </div>
    </article>
  );
};
