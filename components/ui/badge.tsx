import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
        secondary: 'bg-white/10 text-white/70 border border-white/10',
        destructive: 'bg-red-500/20 text-red-300 border border-red-500/30',
        success: 'bg-green-500/20 text-green-300 border border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        gold: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        outline: 'border border-white/20 text-white/70',
        pro: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
