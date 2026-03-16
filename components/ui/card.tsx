interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200 ${
        hover ? "hover:border-neutral-300 hover:shadow-md transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
