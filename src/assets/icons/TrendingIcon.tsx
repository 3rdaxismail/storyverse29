export default function TrendingIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="17" 
      height="20" 
      viewBox="0 0 17 20" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M8.5 1L1 8L8.5 8L8.5 19L16 12H8.5L8.5 1Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="1"
      />
    </svg>
  );
}
