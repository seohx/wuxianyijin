import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export default function Card({ title, description, href, icon }: CardProps) {
  return (
    <Link
      href={href}
      className="group block w-full max-w-sm bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className="p-3 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors duration-300">
              {icon}
            </div>
          )}
          <ArrowRight className="w-6 h-6 text-sky-500 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
