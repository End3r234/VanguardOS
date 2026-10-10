import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/335a4e57f_HlUZofEJSMuw42Q1AWh5Pw_2k-removebg-preview1.png';

export default function VanguardLogo({ size = 'md' }) {
  const heights = { sm: 'h-10', md: 'h-12', lg: 'h-16', xl: 'h-20' };
  return (
    <img
      src={LOGO_URL}
      alt="VanguardOS"
      className={`${heights[size] || heights.md} w-auto object-contain`}
      style={{ filter: 'brightness(1.4) contrast(1.1)' }}
    />
  );
}