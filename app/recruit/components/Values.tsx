import React from "react";

export default function Values() {
  return (
    <section id="values" className="bg-primary text-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className="text-2xl leading-relaxed font-semibold">
            「自分たちで決めるチーム」で働く喜びを、諦めない。
          </p>
          <p className="opacity-95">
            営業が無い時は現場を手伝い、段取り・設備・内装・水回りを学ぶ。<br/>
            だから提案が「口だけ」にならず、成績が上がる。<br/>
            全国のセンチュリー21には良きライバルがいて、<br/>
            大阪のトップには<strong className="font-bold">半年で7,000万円の売上</strong>を達成した営業もいる。<br/>
            ここは、夢のある舞台。仲間と一緒に挑戦する場所。
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <img src="/takuma.jpeg" alt="チームの手応え" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}
