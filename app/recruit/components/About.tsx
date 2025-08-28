import React from "react";

export default function About() {
  return (
    <section id="about" className="py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative">
          <div className="absolute -top-8 -left-4 text-7xl font-extrabold text-gray-100 select-none">ABOUT</div>
          <h3 className="text-2xl md:text-3xl font-extrabold relative">不動産×リフォーム×大手ブランド<br/>「現場力で勝つ」センチュリー21ホームマート</h3>
          <p className="mt-4 text-gray-700">
            代表は20歳で起業し、2025年センチュリー21に参画。<br/>
            自社で大工・内装・設備・水道・電気・ガス・防水まで完結できる「自社施工」が強み。<br/>
            3ヶ月研修と現場OJTで未経験からでも「楽しい営業」へ。<br/>
            売買仲介・買取再販・リフォームを一気通貫で提供します。
          </p>
          <a href="https://form.run/@c21-member" className="btn-primary mt-5 inline-flex">VIEW MORE</a>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <img src="/office.jpg" alt="オフィス" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}
