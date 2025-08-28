"use client";

import React, { useEffect, useRef } from "react";

export default function InstagramSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    wrapRef.current?.appendChild(s);
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold">私たちの「日常」をそのまま</h2>
            <p className="text-gray-600">Instagram（編集：ひな）で、現場感と温度感を発信。</p>
          </div>
          <a className="underline text-primary" href="https://www.instagram.com/century21homemart/" target="_blank" rel="noreferrer">公式Instagramへ</a>
        </div>
        <div className="ig-wrap" ref={wrapRef}>
          <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DMUuOH7zdlj/" data-instgrm-version="14" data-instgrm-captioned style={{background:'#FFF', border:0, borderRadius:8, margin:'1px', width:'100%'}} />
        </div>
        <div className="text-center mt-10">
          <a href="https://form.run/@c21-member" className="btn-primary">3ヶ月研修に応募する</a>
        </div>
      </div>
    </section>
  );
}
