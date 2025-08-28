import React from "react";

const CARDS = [
  {
    title: "1DAY 現場同行",
    desc: "営業がない時間に「現場を知る」。道具・段取り・水回りを体験し、提案の説得力を高める1日。",
    img: "/bathroom_after.jpg",
  },
  {
    title: "リフォーム×営業 体験会",
    desc: "自社施工の強みを活かした提案の作法を体験。Before/Afterの見せ方や見積もりの考え方まで。",
    img: "/kitchen_after.jpg",
  },
  {
    title: "センチュリー21 研修説明会",
    desc: "3ヶ月研修の中身や、全国の仲間との切磋琢磨の仕組みをご紹介。まずは「雰囲気」から。",
    img: "/office.jpg",
  },
];

export default function Events() {
  return (
    <section id="events" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold">採用イベント</h2>
        <p className="text-sm tracking-widest text-gray-500 mt-1">EVENT</p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {CARDS.map((c) => (
            <div key={c.title} className="bg-white rounded-xl shadow card-hover text-left flex flex-col">
              <div className="h-48 overflow-hidden">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <div className="px-5 pt-5 pb-6 space-y-3">
                <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded">イベント</span>
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="text-gray-600">{c.desc}</p>
                <a href="https://form.run/@c21-member" className="btn-primary inline-flex mt-2">詳細を見る</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
