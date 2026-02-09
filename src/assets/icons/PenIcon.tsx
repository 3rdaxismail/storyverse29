export default function PenIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="20" 
      height="23" 
      viewBox="0 0 20 23" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M2 20L18 4M10 2L18 10" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}
