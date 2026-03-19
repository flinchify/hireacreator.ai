"use client";

import { Suspense, Component, type ReactNode, useState, useEffect } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

/* ── Error Boundary ── */
class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ── Performance check ── */
function useCanRender3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // Skip on low-end devices or missing WebGL
    if (typeof window === "undefined") return;
    const cores = navigator.hardwareConcurrency ?? 2;
    if (cores < 4 && /Mobi|Android/i.test(navigator.userAgent)) return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (gl) setOk(true);
    } catch {
      // no WebGL
    }
  }, []);
  return ok;
}

/* ── Wrapper ── */
export function CanvasWrapper({
  children,
  fallback = null,
  className,
  ...props
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
} & Omit<CanvasProps, "children">) {
  const canRender = useCanRender3D();

  if (!canRender) return <>{fallback}</>;

  return (
    <WebGLErrorBoundary fallback={<>{fallback}</>}>
      <Suspense fallback={<>{fallback}</>}>
        <Canvas
          className={className}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          {...props}
        >
          {children}
        </Canvas>
      </Suspense>
    </WebGLErrorBoundary>
  );
}
