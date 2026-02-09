export default function ClockIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="13" 
      height="14" 
      viewBox="0 0 13 14" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M6.5 0.333344C3.18629 0.333344 0.5 3.01963 0.5 6.33334C0.5 9.64706 3.18629 12.3333 6.5 12.3333C9.81371 12.3333 12.5 9.64706 12.5 6.33334C12.5 3.01963 9.81371 0.333344 6.5 0.333344ZM6.5 11.3333C3.73858 11.3333 1.5 9.09477 1.5 6.33334C1.5 3.57191 3.73858 1.33334 6.5 1.33334C9.26142 1.33334 11.5 3.57191 11.5 6.33334C11.5 9.09477 9.26142 11.3333 6.5 11.3333Z" 
        fill="currentColor"
      />
      <path 
        d="M6.5 3.33334V6.33334L9 7.83334" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
      />
    </svg>
  );
}
