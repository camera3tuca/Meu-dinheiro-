import React from 'react';

interface ScienceBitLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const ScienceBitLogo: React.FC<ScienceBitLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeStyles = {
    sm: {
      text: 'text-base font-extrabold tracking-tight',
      sub: 'text-[7px] tracking-[0.22em]',
      line: 'w-2.5 h-[1.5px]',
      gap: 'gap-0.5',
    },
    md: {
      text: 'text-xl font-extrabold tracking-tight',
      sub: 'text-[9px] tracking-[0.25em]',
      line: 'w-3.5 h-[2px]',
      gap: 'gap-1',
    },
    lg: {
      text: 'text-2xl font-black tracking-tight',
      sub: 'text-[11px] tracking-[0.28em]',
      line: 'w-5 h-[2px]',
      gap: 'gap-1.5',
    },
    xl: {
      text: 'text-3xl font-black tracking-tight',
      sub: 'text-[12px] tracking-[0.3em]',
      line: 'w-6 h-[2.5px]',
      gap: 'gap-2',
    },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Main Text: Science (Black) + Bit (Blue) */}
      <div className={`leading-none flex items-baseline ${sizeStyles.text}`}>
        <span className="text-[#0A0A0A] font-extrabold">Science</span>
        <span className="text-[#1366E2] font-extrabold ml-0.5">Bit</span>
      </div>

      {/* Subtitle: — COMPUTER — */}
      {showSubtitle && (
        <div className={`flex items-center justify-center text-[#1E1E1E] font-bold ${sizeStyles.sub} ${sizeStyles.gap} mt-1 w-full`}>
          <span className={`bg-[#1366E2] ${sizeStyles.line} rounded-full`} />
          <span className="text-[#0A0A0A] px-1 font-bold">COMPUTER</span>
          <span className={`bg-[#1366E2] ${sizeStyles.line} rounded-full`} />
        </div>
      )}
    </div>
  );
};
