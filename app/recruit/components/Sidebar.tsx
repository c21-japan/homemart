import React from "react";

export default function Sidebar() {
  return (
    <div className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
      <a href="https://form.run/@c21-member" target="_blank" rel="noreferrer"
         className="px-3 py-2 rounded-md bg-primary text-white font-bold shadow">ENTRY</a>
      <a href="#events" className="px-3 py-2 rounded-md bg-orange-500 text-white font-bold shadow">EVENT</a>
      <a href="https://www.instagram.com/century21homemart/" target="_blank" rel="noreferrer"
         className="px-3 py-2 rounded-md bg-blue-500 text-white font-bold shadow">SNS</a>
    </div>
  );
}
