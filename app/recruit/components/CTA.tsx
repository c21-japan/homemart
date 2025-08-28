import React from "react";

export default function CTA() {
  return (
    <section id="cta" className="bg-primary text-white py-16 text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">一緒に成長できる仲間を募集</h2>
        <p className="mt-3 opacity-90">
          選考では「マッチング」を大切にしています。<br/>
          まずは3ヶ月研修から、雰囲気と価値観をすり合わせましょう。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://form.run/@c21-member" className="bg-white text-primary px-6 py-3 rounded-lg font-bold">エントリーする</a>
          <a href="#events" className="bg-orange-500 px-6 py-3 rounded-lg font-bold">説明会に参加する</a>
        </div>
      </div>
    </section>
  );
}
