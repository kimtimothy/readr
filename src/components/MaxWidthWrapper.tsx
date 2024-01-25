import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const MaxWidthWrapper = ({
  className,
  children,
} : {
  className?: string
  children: ReactNode;
}) => {

  return (
    <div className={cn('max-w-screen-xl mx-auto w-full px-2.5 md:px-20', className)}>
      {children}
    </div>
  )
}

export default MaxWidthWrapper;