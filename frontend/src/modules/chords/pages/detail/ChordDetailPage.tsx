import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { transposeKey } from "@/lib/chords/transpose";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/error-toast.helper";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { Spinner } from "@/shared/components/spinner/Spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/shadcn/ui/alert-dialog";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { ChordSheet } from "../../components/chord-sheet/ChordSheet";
import { TransposeBar } from "../../components/transpose-bar/TransposeBar";
import { useComposition, useDeleteComposition } from "../../hooks/use-compositions";
import { ChordEditorPage } from "../editor/ChordEditorPage";

const formatDate = (date?: Date): string =>
    date
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
        : "";

/**
 * Read view of a chord sheet: title, key/capo/tempo badges, transposition and
 * the plain sheet. With `?mode=edit` the same route hosts the editor instead.
 */
export const ChordDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditing = searchParams.get("mode") === "edit";

    const { user } = useAuthUser();
    const composition = useComposition(user?.uid, id);
    const deleteMutation = useDeleteComposition(user?.uid);

    const [semitones, setSemitones] = useState(0);

    /** Returning from the editor to the read view starts from the saved key. */
    const [wasEditing, setWasEditing] = useState(isEditing);

    if (isEditing !== wasEditing) {
        setWasEditing(isEditing);

        if (!isEditing)
            setSemitones(0);
    }

    if (isEditing && id)
        return <ChordEditorPage id={id} />;

    if (composition.isLoading)
        return (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
                <Spinner variant="foreground" />
                Loading chord sheet…
            </div>
        );

    if (composition.isError)
        return (
            <div className="flex flex-col gap-4">
                <CardAlert
                    type="warning"
                    title="Could not load this chord sheet"
                    message="It may not exist, or the Firestore security rules (firestore.rules) are not deployed yet."
                />
                <Button render={<Link to="/chords" />} nativeButton={false} variant="outline" className="self-start">
                    <ArrowLeftIcon />
                    Back to chords
                </Button>
            </div>
        );

    const data = composition.data;

    if (!data)
        return (
            <div className="flex flex-col gap-4">
                <CardAlert
                    title="Chord sheet not found"
                    message="This chord sheet does not exist or is not yours."
                />
                <Button render={<Link to="/chords" />} nativeButton={false} variant="outline" className="self-start">
                    <ArrowLeftIcon />
                    Back to chords
                </Button>
            </div>
        );

    const writtenKey = data.key ? transposeKey(data.key, semitones) : undefined;

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(data.id);
            showSuccessToast("Chord sheet deleted");
            navigate("/chords", { replace: true });
        }
        catch (error) {
            console.error(error);
            showErrorToast("Could not delete the chord sheet", "Check your connection and try again.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                    <Link
                        to="/chords"
                        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <ArrowLeftIcon className="size-4" />
                        Chords
                    </Link>
                    <h1 className="font-heading text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                        {data.title}
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Button render={<Link to={`/chords/${data.id}?mode=edit`} />} nativeButton={false} variant="outline" size="sm">
                        <PencilIcon />
                        Edit
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger
                            render={
                                <Button variant="destructive" size="sm">
                                    <Trash2Icon />
                                    Delete
                                </Button>
                            }
                        />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this chord sheet?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    “{data.title}” will be removed permanently. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => void handleDelete()}
                                >
                                    {deleteMutation.isPending && <Spinner variant="destructive" />}
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                    Key: {writtenKey ?? "—"}
                </Badge>
                {data.key && data.capo > 0 && (
                    <Badge variant="outline">
                        Sounds in {transposeKey(data.key, data.capo + semitones)}
                    </Badge>
                )}
                {data.capo > 0 && (
                    <Badge variant="outline">Capo {data.capo}</Badge>
                )}
                {data.tempo && (
                    <Badge variant="outline">{data.tempo}</Badge>
                )}
                {data.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                        Updated {formatDate(data.updatedAt)}
                    </span>
                )}
            </div>

            {/* Transposition */}
            <TransposeBar
                originalKey={data.key}
                semitones={semitones}
                onChange={setSemitones}
            />

            {/* Sheet */}
            {data.content.trim() ? (
                <ChordSheet
                    content={data.content}
                    semitones={semitones}
                    originalKey={data.key}
                />
            ) : (
                <CardAlert
                    title="Empty chord sheet"
                    message="This chord sheet has no sections yet. Use Edit to write it."
                />
            )}
        </div>
    );
};
