import React from "react";

export default function Hero() {
  return (
    <section className="relative hero-grad">
      <div className="absolute inset-0">
        <img src="/office.jpg" alt="ヒーロー背景" className="w-full h-full object-cover opacity-30" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow">
          すべてを叶える働き方は、ここにある。
        </h1>
        <p className="text-white/90 text-lg md:text-2xl mt-4">
          「怖い営業」を「楽しい営業」へ。<br/>
          3ヶ月研修＋現場OJT＋仲間の助け合いで、未経験から着実に成長。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="https://form.run/@c21-member" className="btn-primary">3ヶ月研修に応募する</a>
          <a href="#values" className="btn-outline">Scroll Down</a>
        </div>
      </div>
    </section>
  );
}
