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

  useEffect(() => {
    // After the animation duration, switch to static image
    const timer = setTimeout(() => {
      setShowStatic(true);
    }, loopDuration);

    return () => clearTimeout(timer);
  }, [loopDuration]);

  return (
    <img
      src={showStatic ? staticSrc : src}
      alt={alt}
      className={className}
    />
  );
}
