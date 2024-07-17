"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

export function WebAnalitics() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const ym =
      // @ts-expect-error
      window.ym ?? // @ts-expect-error
      ((...args) => {
        console.warn("ym не загружена", args);
      });
    ym(97857603, "hit", window.location.href);
  }, [pathName, searchParams]);
  return (
    <>
      <Script id="yandex-metrika">
        {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
     
        ym(97857603, "init", {
             clickmap:true,
             trackLinks:true,
             accurateTrackBounce:true
        });
      `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://mc.yandex.ru/watch/97857603"
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
