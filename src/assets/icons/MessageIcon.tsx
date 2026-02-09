import React from 'react';

interface MessageIconProps {
  className?: string;
  hasUnread?: boolean;
}

export default function MessageIcon({ className = '', hasUnread = false }: MessageIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Message bubble */}
      <path
        d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={hasUnread ? "currentColor" : "none"}
        opacity={hasUnread ? "0.2" : "1"}
      />
      
      {/* Unread indicator dot */}
      {hasUnread && (
        <circle
          cx="19"
          cy="5"
          r="3"
          fill="#FF4444"
          stroke="white"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
