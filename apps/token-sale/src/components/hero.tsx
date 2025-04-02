import React, { PropsWithChildren } from "react";
import phoneVideo from "@/assets/videos/phone-connor-promo.mp4";
import wideVideo from "@/assets/videos/large-connor-promo.mp4";

const Hero: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-black opacity-50"></div>
      <video
        className="-mt-24 hidden h-full w-full object-cover md:block"
        src={wideVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <video
        className="block h-full w-full object-cover md:hidden"
        src={phoneVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      {children}
    </section>
  );
};

export default Hero;
