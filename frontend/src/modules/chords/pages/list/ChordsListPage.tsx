import { Link } from "react-router";

import { MusicIcon, PenLineIcon } from "lucide-react";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { useCompositions } from "../../hooks/use-compositions";
import type { Composition } from "../../interfaces/composition";

const formatDate = (date?: Date): string =>
    date
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
        : "";

/** First lines of the sheet, shown as a preview of the card. */
const previewOf = (composition: Composition): string => {
    const lines = composition.content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 2);

    return lines.length > 0 ? lines.join(" · ") : "Empty chord sheet";
};

/**
 * Library of the chord sheets of the signed-in user.
 */
export const ChordsListPage = () => {
    const { user } = useAuthUser();
    const compositions = useCompositions(user?.uid);

    return (
        <div className="flex flex-col gap-8">
            <PageTitle
                eyebrow="Your library"
                title="Chords"
                subtitle="Every chord sheet you write, with its sections, chords and lyrics."
                actions={
                    <Button render={<Link to="/chords/new" />} nativeButton={false}>
                        <PenLineIcon />
                        New chord sheet
                    </Button>
                }
            />

            {compositions.isLoading && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                    <Spinner variant="foreground" />
                    Loading your chord sheets…
                </div>
            )}

            {compositions.isError && (
                <CardAlert
                    type="warning"
                    title="Could not load your chord sheets"
                    message="Check your connection and make sure the Firestore security rules (firestore.rules) are deployed."
                />
            )}

            {compositions.data && compositions.data.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10">
                            <MusicIcon className="size-5 text-primary" />
                        </span>
                        <div className="flex flex-col gap-1.5">
                            <p className="font-heading text-lg font-semibold tracking-[-0.02em]">
                                No chord sheets yet
                            </p>
                            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                                Start with your first song: add a title, write each section
                                and keep the chords above the lyrics.
                            </p>
                        </div>
                        <Button render={<Link to="/chords/new" />} nativeButton={false}>
                            <PenLineIcon />
                            Write your first chord sheet
                        </Button>
                    </CardContent>
                </Card>
            )}

            {compositions.data && compositions.data.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {compositions.data.map((composition) => (
                        <Card key={composition.id} className="relative transition-shadow hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="line-clamp-1 pr-6 text-base">
                                    {composition.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 font-mono text-xs">
                                    {previewOf(composition)}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter className="flex items-center justify-between gap-2">
                                <span className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="secondary">
                                        {composition.key ? `Key ${composition.key}` : "Key —"}
                                    </Badge>
                                    {composition.capo > 0 && (
                                        <Badge variant="outline">Capo {composition.capo}</Badge>
                                    )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(composition.updatedAt ?? composition.createdAt)}
                                </span>
                            </CardFooter>

                            <Link
                                to={`/chords/${composition.id}`}
                                className="after:absolute after:inset-0"
                                aria-label={`Open ${composition.title}`}
                            />
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
