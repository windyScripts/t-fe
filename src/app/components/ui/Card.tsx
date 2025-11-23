type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return <div className={`glass ${className}`.trim()}>{children}</div>;
}
