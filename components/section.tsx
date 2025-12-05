import * as React from 'react';
import { cn } from '@/lib/utils';
import { MotionEffect } from './effects/motion-effect';

// Wrapper general de cada sección
export const Section = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => {
        return <section ref={ref} className={cn('py-10 scroll-mt-16 z-0', className)} {...props} />;
    }
);
Section.displayName = 'Section';

export const SectionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)} {...props}>
                {children}
            </div>
        );
    }
);
SectionContent.displayName = 'SectionContent';

// Contenedor del header
export const SectionHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn('text-center mb-16', className)} {...props} />;
    }
);
SectionHeader.displayName = 'SectionHeader';

// Título
export const SectionTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <MotionEffect
                slide={{
                    direction: 'down',
                }}
                fade
                inView
            >
                <h2 ref={ref} className={cn('text-3xl md:text-4xl font-black mb-4', className)} {...props}>
                    <span className="text-primary">/</span> {children}
                </h2>
            </MotionEffect>
        );
    }
);
SectionTitle.displayName = 'SectionTitle';

// Descripción
export const SectionDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        return (
            <MotionEffect
                slide={{
                    direction: 'down',
                }}
                fade
                inView
                delay={0.05}
            >
                <p ref={ref} className={cn('text-muted-foreground max-w-2xl mx-auto', className)} {...props} />
            </MotionEffect>
        );
    }
);
SectionDescription.displayName = 'SectionDescription';
