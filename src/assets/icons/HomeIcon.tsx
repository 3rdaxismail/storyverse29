export default function HomeIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="19" 
      height="18" 
      viewBox="0 0 19 18" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M1 6.5L9.5 1L18 6.5V16.5C18 17 17.5 17.5 17 17.5H2C1.5 17.5 1 17 1 16.5V6.5Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="1"
      />
    </svg>
  );
}
