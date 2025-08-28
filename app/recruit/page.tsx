import React from "react";
import "./recruit.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import Values from "./components/Values";
import Events from "./components/Events";
import About from "./components/About";
import Voices from "./components/Voices";
import Works from "./components/Works";
import Office from "./components/Office";
import InstagramSection from "./components/InstagramSection";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function RecruitPage() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <Hero />
        <Values />
        <Events />
        <About />
        <Voices />
        <Works />
        <Office />
        <InstagramSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
