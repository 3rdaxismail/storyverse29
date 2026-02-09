export default function ShareIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 14 14" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M11 9.33334V11.6667C11 12.403 10.403 13 9.66667 13H2.33333C1.59695 13 1 12.403 1 11.6667V4.33334C1 3.59695 1.59695 3 2.33333 3H4.66667M8.33333 1H13M13 1V5.66667M13 1L6 8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
