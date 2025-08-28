import React from "react";

const members = [
  {
    name: "たくま",
    role: "工務",
    img: "/takuma.jpeg",
    text: "営業がない日は現場を手伝います。段取り・内装・水回り…全部が提案の説得力に。口だけじゃない営業になれます。",
  },
  {
    name: "ひな",
    role: "事務・SNS編集",
    img: "/hina.jpeg",
    text: "Instagramは私が編集。リアルな空気感をそのまま発信。堅すぎず、でもお客様にも仲間にも誠実でいたい職場です。",
  },
  {
    name: "みか",
    role: "経理",
    img: "/mika.jpeg",
    text: "努力が数字で正しく評価される仕組み。困ったら「すぐ助けてもらえる」安心感があるから、挑戦できます。",
    contain: true, // 顔が切れないよう contain
  },
];

export default function Voices() {
  return (
    <section id="voices" className="py-16 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold">人を知る</h2>
        <p className="text-sm tracking-widest text-white/70 mt-1">INTERVIEW</p>

        <div className="grid md:grid-cols-3 gap-8 mt-10 text-left">
          {members.map((m) => (
            <article key={m.name} className="bg-white/5 rounded-2xl p-6 card-hover">
              <div className={`frame portrait mb-4`}>
                <img src={m.img} alt={`${m.role} ${m.name}`} className={m.contain ? "object-contain bg-white" : ""} />
              </div>
              <h3 className="text-xl font-bold">{m.name} <span className="text-primary text-sm font-semibold">{m.role}</span></h3>
              <p className="text-white/90 mt-2">{m.text}</p>
            </article>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <div className="frame portrait mx-auto mb-4" style={{maxWidth: 280}}>
            <img src="/inui.jpeg" alt="代表 乾 佑企" />
          </div>
          <h3 className="text-2xl font-bold">乾 佑企 <span className="text-primary text-base font-semibold">代表</span></h3>
          <p className="text-white/90 mt-2">
            「成績が上がらないのは教える側の責任。未経験でも「楽しい営業」に変えていく。<br/>
            営業が無い日は現場を覚え、提案力で勝つ。全国のセンチュリー21には良きライバルがたくさん。<br/>
            大阪のトップには半年で7,000万円を売上げた営業も。夢のある舞台で一緒に挑戦しましょう。」
          </p>
          <a href="https://form.run/@c21-member" className="btn-primary mt-6 inline-flex">3ヶ月研修に応募する</a>
        </div>
      </div>
    </section>
  );
}
