import React from 'react';
import { AboutArticle } from '../types/cms';
import { HerbariumImage } from './HerbariumImage';

interface AboutViewProps {
  about: AboutArticle;
}

export const AboutView: React.FC<AboutViewProps> = ({ about }) => {
  return (
    <section className="mx-auto w-full max-w-[1440px]">
      <div className="bg-[#F4F3EF] px-6 pt-6 pb-4 sm:px-10 sm:pt-10">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl">
          About
        </h1>
      </div>

      <article className="max-w-3xl px-6 pt-4 pb-12 sm:px-10 sm:pt-6 sm:pb-16">
        <div className="space-y-10">
          {about.blocks.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6E706E]">
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
    </section>
  );
};
