import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-8 h-8",
  size,
  alt = "MyBilling Logo",
  showText = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <img
        src="/Logo.png"
        alt={alt}
        className={`object-contain ${className}`}
        style={style}
        loading="eager"
      />
      {showText && (
        <span className="font-bold tracking-tight text-lg text-inherit">
          MyBilling
        </span>
      )}
    </div>
  );
};

export default Logo;
