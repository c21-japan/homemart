"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";

function BA({ before, after, orient="portrait", title, hint }: {
  before: string;
  after: string;
  orient?: "portrait" | "landscape";
  title: string;
  hint: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ba = ref.current;
    if (!ba) return;
    
    const afterImg = ba.querySelector(".after") as HTMLElement;
    const handle = ba.querySelector(".handle") as HTMLElement;
    const knob = ba.querySelector(".knob") as HTMLElement;
    
    let down = false;
    
    const setFromX = (clientX: number) => {
      const rect = ba.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = (x / rect.width) * 100;
      afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + "%";
      knob.style.left = pct + "%";
    };
    
    const start = (e: MouseEvent | TouchEvent) => { 
      down = true; 
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setFromX(clientX); 
    };
    
    const move = (e: MouseEvent | TouchEvent) => { 
      if (!down) return; 
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setFromX(clientX); 
    };
    
    const end = () => { down = false; };
    
    ba.addEventListener("mousedown", start);
    ba.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    ba.addEventListener("touchstart", start, {passive: true});
    ba.addEventListener("touchmove", move, {passive: true});
    window.addEventListener("touchend", end);
    
    // 初期中央
    const rect = ba.getBoundingClientRect();
    setFromX(rect.left + rect.width/2);
    
    return () => {
      ba.removeEventListener("mousedown", start);
      ba.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      ba.removeEventListener("touchstart", start);
      ba.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
  }, []);

  return (
    <div className="bg-cream rounded-xl p-5 shadow card-hover">
      <h3 className="text-lg font-bold text-gold mb-3 text-center">{title}</h3>
      <div className={`frame ${orient === "portrait" ? "portrait" : "landscape"}`}>
        <div className="ba" ref={ref}>
          <img src={before} alt={`${title} 施工前`} />
          <img src={after} alt={`${title} 施工後`} className="after" />
          <div className="handle" />
          <div className="knob"><ArrowLeftRight size={20}/></div>
          <span className="tag left">Before</span>
          <span className="tag right">After</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3 text-center">{hint}</p>
    </div>
  );
}

export default function Works() {
  return (
    <section id="works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">自社施工の「凄さ」が営業の武器</h2>
        <p className="text-gray-600 mt-2">
          大工・内装・設備・水道・電気・ガス・防水まで一貫。品質・スピード・価格訴求で選ばれます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <BA title="洗面台リフォーム"
              before="/washroom_before.jpg" after="/washroom_after.jpg" orient="portrait"
              hint="中央の ◀▶ を左右にドラッグして比較できます" />
          <BA title="トイレリフォーム"
              before="/toilet_before.jpg" after="/toilet_after.jpg" orient="portrait"
              hint="スライドして違いを体感してください" />
          <BA title="浴室リフォーム"
              before="/bathroom_before.jpg" after="/bathroom_after.jpg" orient="landscape"
              hint="快適さの進化を指先でスライドして確認" />
          <BA title="キッチンリフォーム"
              before="/kitchen_before.jpg" after="/kitchen_after.jpg" orient="landscape"
              hint="BeforeとAfterを自由に重ねて比較" />
        </div>

        <a href="https://form.run/@c21-member" className="btn-primary mt-10 inline-flex">3ヶ月研修に応募する</a>
      </div>
    </section>
  );
}
