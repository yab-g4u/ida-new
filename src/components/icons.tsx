import { Heart, Plus } from 'lucide-react';
import type { SVGProps } from 'react';

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement> & {className?: string}) => (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Heart className="size-full text-primary" fill="hsl(var(--primary))" strokeWidth={1} />
      <Plus className="absolute size-1/2 text-background" strokeWidth={3}/>
    </div>
  ),
};
