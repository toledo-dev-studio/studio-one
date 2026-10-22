import type { ReactNode } from "react";

interface Props {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

/**
 * Page header with an optional eyebrow and action slot.
 */
export const PageTitle = ({ eyebrow, title, subtitle, actions }: Props) => {
    return (
        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
                {eyebrow && (
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {eyebrow}
                    </p>
                )}
                <h1 className="font-heading text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-4xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </section>
    );
};
