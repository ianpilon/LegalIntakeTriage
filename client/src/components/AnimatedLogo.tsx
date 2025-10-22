import { useEffect, useState } from "react";

interface AnimatedLogoProps {
  src: string;
  staticSrc: string;
  alt: string;
  className?: string;
  loopDuration?: number; // duration in milliseconds (how long one loop takes)
}

export function AnimatedLogo({
  src,
  staticSrc,
  alt,
  className = "",
  loopDuration = 8000
}: AnimatedLogoProps) {
  const [showStatic, setShowStatic] = useState(false);

  // Get base URL from Vite for proper path resolution on GitHub Pages
  const base = import.meta.env.BASE_URL;
  const fullSrc = src.startsWith('http') ? src : `${base}${src.replace(/^\//, '')}`;
  const fullStaticSrc = staticSrc.startsWith('http') ? staticSrc : `${base}${staticSrc.replace(/^\//, '')}`;

  useEffect(() => {
    // After the animation duration, switch to static image
    const timer = setTimeout(() => {
      setShowStatic(true);
    }, loopDuration);

    return () => clearTimeout(timer);
  }, [loopDuration]);

  return (
    <img
      src={showStatic ? fullStaticSrc : fullSrc}
      alt={alt}
      className={className}
    />
  );
}
