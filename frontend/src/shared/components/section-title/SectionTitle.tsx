interface Props {
    title: string;
    description?: string;
}

/**
 * Section heading used to separate blocks inside a page.
 */
export const SectionTitle = ({ title, description }: Props) => {
    return (
        <section className="flex flex-col gap-1.5">
            <h2 className="font-heading text-lg font-semibold tracking-[-0.02em]">
                {title}
            </h2>
            {description && (
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </section>
    );
};
