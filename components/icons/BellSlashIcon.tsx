import React from 'react';

const BellSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75a4.5 4.5 0 01-4.5 4.5m4.5-4.5a4.5 4.5 0 00-4.5-4.5M12 9.75L12 15m0-5.25A4.5 4.5 0 007.5 15m0 0l-1.06-1.06A9 9 0 003.75 9.75v-.75A6 6 0 0112 3v.75m0 1.5v-1.5m-6.75 6.75l1.06-1.06M15.75 9.75l-1.06-1.06m-6.75 6.75L9 12.75l1.06-1.06m-6.75 6.75L4.5 15M21 15h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
);

export default BellSlashIcon;
