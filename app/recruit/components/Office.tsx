import React from "react";

export default function Office() {
  return (
    <section id="office" className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">働く環境</h2>
        <p className="text-gray-700 mt-2">明るく開放的、でも温度のあるオフィス。日常の自動化で「面倒」を減らし、仕事に集中できます。</p>
        <div className="frame landscape mx-auto mt-8" style={{maxWidth: 1100}}>
          <img src="/office.jpg" alt="センチュリー21ホームマートのオフィス" loading="lazy"/>
        </div>
        <a href="https://form.run/@c21-member" className="btn-primary mt-8 inline-flex">3ヶ月研修に応募する</a>
      </div>
    </section>
  );
}
