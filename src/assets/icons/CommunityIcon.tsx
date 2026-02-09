export default function CommunityIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="18" 
      height="16" 
      viewBox="0 0 18 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M12 13V11.5C12 10.1 11 9 9.5 9H3.5C2 9 1 10.1 1 11.5V13M17 13V11.5C17 10.5 16.5 9.6 15.7 9.2M12 1.2C12.8 1.6 13.3 2.5 13.3 3.5C13.3 4.5 12.8 5.4 12 5.8M9.5 4C9.5 5.7 8.2 7 6.5 7C4.8 7 3.5 5.7 3.5 4C3.5 2.3 4.8 1 6.5 1C8.2 1 9.5 2.3 9.5 4Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
