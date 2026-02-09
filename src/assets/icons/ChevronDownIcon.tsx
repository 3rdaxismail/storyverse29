export default function ChevronDownIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="8" 
      height="4" 
      viewBox="0 0 8 4" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M1 0.5L4 3.5L7 0.5" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
