"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Suspense } from "react";

function ProgressbarProvider({ children }: React.PropsWithChildren) {
    return (
        <Suspense fallback={null}>
            {children}
            <ProgressBar
                height="4px"
                color="#0070f3"
                options={{
                    showSpinner: true,
                    easing: "ease",
                    speed: 500,
                    trickleSpeed: 200,
                    minimum: 0.08,
                }}
                shallowRouting={true}
                delay={100}
            />
        </Suspense>
    );
}

export default ProgressbarProvider;
