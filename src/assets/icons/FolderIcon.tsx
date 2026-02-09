export default function FolderIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="20" 
      height="16" 
      viewBox="0 0 20 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M0 2C0 0.9 0.9 0 2 0H7L9 2H18C19.1 2 20 2.9 20 4V14C20 15.1 19.1 16 18 16H2C0.9 16 0 15.1 0 14V2Z" 
        fill="currentColor"
      />
    </svg>
  );
}
