import React from "react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gold mb-2">センチュリー21ホームマート</h3>
          <p className="text-sm">不動産売買・仲介／リフォーム・リノベーション／住宅設備工事</p>
          <p className="text-sm mt-2">〒635-0821　奈良県北葛城郡広陵町笠287-1</p>
          <p className="text-sm mt-1">
            <i className="fa-solid fa-phone text-gold mr-2"/> <a href="tel:0120438639" className="underline">0120-43-8639</a>
          </p>
          <a href="https://form.run/@c21-member" className="btn-primary mt-4 inline-flex">ENTRY FORM</a>
        </div>
        <div>
          <iframe
            className="w-full h-72 rounded-lg border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.322459412753!2d135.7463112!3d34.5453901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60012d16fef4735b%3A0xb49d8a4f54fd9786!2z44K744Oz44OB44Ol44Oq44O8MjHjg5vjg7zjg6Djg57jg7zjg4g!5e0!3m2!1sja!2sjp!4v1756394207847!5m2!1sja!2sjp"
            title="センチュリー21ホームマート所在地"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-white/70">
          © 2025 センチュリー21ホームマート. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
