import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router";

import {
    ArrowLeftIcon,
    PlusIcon,
    SparklesIcon,
    WandSparklesIcon,
    XIcon,
} from "lucide-react";

import { MAJOR_KEY_LABELS, MINOR_KEY_LABELS, detectKey, type KeyDetection } from "@/lib/chords/detect";
import { soundingKey } from "@/lib/chords/transpose";
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
} from "@/shared/shadcn/ui/alert-dialog";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/shared/shadcn/ui/select";
import { ChordSheet } from "../../components/chord-sheet/ChordSheet";
import { ChordsRail } from "../../components/chords-rail/ChordsRail";
import { SectionBlockEditor } from "../../components/section-block/SectionBlockEditor";
import { TransposeBar } from "../../components/transpose-bar/TransposeBar";
import { blocksFromContent, contentFromBlocks, createBlockId } from "../../helpers/serialize";
import { useComposition, useCreateComposition, useUpdateComposition } from "../../hooks/use-compositions";
import type { CompositionDraft, SectionBlock } from "../../interfaces/composition";

/** Sentinel stored in the key select when the song has no key yet. */
const NO_KEY = "none";

/** The capo select offers every fret a capo can sit on. */
const CAPO_OPTIONS = Array.from({ length: 13 }, (_, fret) => fret);

/** Snapshot of everything the user can edit, used to detect unsaved changes. */
const snapshotOf = (state: {
    title: string;
    key: string;
    capo: number;
    tempo: string;
    blocks: SectionBlock[];
}): string =>
    JSON.stringify({
        title: state.title,
        key: state.key,
        capo: state.capo,
        tempo: state.tempo,
        content: contentFromBlocks(state.blocks),
    });

interface Props {
    /** Document id; when present the editor updates an existing composition. */
    id?: string;
}

/**
 * Shared editor for creating and editing a chord sheet.
 *
 * The plain text stored in Firestore is the single source of truth: the
 * editor splits it into per-section blocks and serializes them back on save.
 */
export const ChordEditorPage = ({ id }: Props) => {
    const { user } = useAuthUser();
    const navigate = useNavigate();

    const composition = useComposition(user?.uid, id);
    const createMutation = useCreateComposition(user?.uid);
    const updateMutation = useUpdateComposition(user?.uid);

    const [title, setTitle] = useState("");
    const [key, setKey] = useState("");
    const [capo, setCapo] = useState(0);
    const [tempo, setTempo] = useState("");
    const [blocks, setBlocks] = useState<SectionBlock[]>(() => [
        { id: createBlockId(), label: "", body: "" },
    ]);
    const [baseline, setBaseline] = useState<string | null>(null);

    const [view, setView] = useState<"edit" | "preview">("edit");
    const [previewSemitones, setPreviewSemitones] = useState(0);
    const [suggestion, setSuggestion] = useState<KeyDetection | null>(null);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
    const activeBlockId = useRef<string | null>(null);

    /** Loads an existing composition into the form, once per document. */
    const [loadedId, setLoadedId] = useState<string | null>(null);

    if (composition.data && loadedId !== composition.data.id) {
        setLoadedId(composition.data.id);

        const loaded = {
            title: composition.data.title,
            key: composition.data.key ?? "",
            capo: composition.data.capo,
            tempo: composition.data.tempo ?? "",
            blocks: blocksFromContent(composition.data.content),
        };

        setTitle(loaded.title);
        setKey(loaded.key);
        setCapo(loaded.capo);
        setTempo(loaded.tempo);
        setBlocks(loaded.blocks);
        setBaseline(snapshotOf(loaded));
    }

    const currentSnapshot = useMemo(
        () => snapshotOf({ title, key, capo, tempo, blocks }),
        [title, key, capo, tempo, blocks]
    );
    const dirty = baseline !== null && currentSnapshot !== baseline;
    const serializedContent = useMemo(() => contentFromBlocks(blocks), [blocks]);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const updateBlock = useCallback((blockId: string, patch: Partial<SectionBlock>) => {
        setBlocks((current) =>
            current.map((block) => (block.id === blockId ? { ...block, ...patch } : block))
        );
    }, []);

    const moveBlock = useCallback((blockId: string, direction: -1 | 1) => {
        setBlocks((current) => {
            const index = current.findIndex((block) => block.id === blockId);
            const target = index + direction;

            if (index < 0 || target < 0 || target >= current.length)
                return current;

            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];

            return next;
        });
    }, []);

    const removeBlock = useCallback((blockId: string) => {
        setBlocks((current) =>
            current.length > 1 ? current.filter((block) => block.id !== blockId) : current
        );
    }, []);

    const addBlock = useCallback(() => {
        setBlocks((current) => [...current, { id: createBlockId(), label: "", body: "" }]);
    }, []);

    /** Inserts a chord where the cursor is, keeping single spaces around it. */
    const insertChord = useCallback(
        (token: string) => {
            const targetId = activeBlockId.current ?? blocks.at(-1)?.id;

            if (!targetId)
                return;

            const block = blocks.find((entry) => entry.id === targetId);
            const textarea = textareaRefs.current[targetId];

            if (!block)
                return;

            if (!textarea) {
                const separator = block.body.length > 0 && !block.body.endsWith(" ") ? " " : "";
                updateBlock(targetId, { body: `${block.body}${separator}${token}` });
                return;
            }

            const start = textarea.selectionStart ?? block.body.length;
            const end = textarea.selectionEnd ?? start;
            const before = block.body.slice(0, start);
            const after = block.body.slice(end);
            const separator = before.length > 0 && !/\s$/.test(before) ? " " : "";
            const inserted = `${separator}${token}`;

            updateBlock(targetId, { body: `${before}${inserted}${after}` });

            requestAnimationFrame(() => {
                textarea.focus();
                const caret = start + inserted.length;
                textarea.setSelectionRange(caret, caret);
            });
        },
        [blocks, updateBlock]
    );

    const handleDetectKey = () => {
        const detection = detectKey(serializedContent);

        if (!detection.key) {
            showSuccessToast("Nothing to detect yet", "Write a few chords and try again.");
            return;
        }

        setSuggestion(detection);
    };

    const handleSave = useCallback(async () => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            showErrorToast("A title is required", "Give the chord sheet a name before saving.");
            titleInputRef.current?.focus();
            return;
        }

        const draft: CompositionDraft = {
            title: trimmedTitle,
            key: key || undefined,
            capo,
            tempo: tempo.trim() || undefined,
            content: contentFromBlocks(blocks),
        };

        try {
            if (id) {
                await updateMutation.mutateAsync({ id, draft });
                showSuccessToast("Chord sheet saved");
            }
            else {
                const newId = await createMutation.mutateAsync(draft);
                showSuccessToast("Chord sheet created");
                navigate(`/chords/${newId}`, { replace: true });
            }

            setBaseline(snapshotOf({ title: draft.title, key: draft.key ?? "", capo: draft.capo, tempo: draft.tempo ?? "", blocks }));
        }
        catch (error) {
            console.error(error);
            showErrorToast("Could not save the chord sheet", "Check your connection and try again.");
        }
    }, [blocks, capo, createMutation, id, key, navigate, tempo, title, updateMutation]);

    /** Cmd/Ctrl+S saves without leaving the keyboard. */
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                void handleSave();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handleSave]);

    /** Warns before closing the tab with unsaved changes. */
    useEffect(() => {
        if (!dirty)
            return;

        const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

        window.addEventListener("beforeunload", onBeforeUnload);

        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirty]);

    /** Blocks in-app navigation while there are unsaved changes. */
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            dirty && currentLocation.pathname !== nextLocation.pathname
    );

    const handleBack = () => navigate(id ? `/chords/${id}` : "/chords");

    if (id && composition.isLoading)
        return (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
                <Spinner variant="foreground" />
                Loading chord sheet…
            </div>
        );

    if (id && composition.isError)
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

    if (id && !composition.data)
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

    return (
        <div className="flex flex-col gap-6">
            {/* Title row */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Back">
                    <ArrowLeftIcon />
                </Button>
                <Input
                    ref={titleInputRef}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Song title"
                    aria-label="Song title"
                    className="h-10 flex-1 border-transparent bg-transparent px-2 font-heading text-xl font-semibold tracking-[-0.02em] shadow-none outline-none placeholder:text-muted-foreground/70 hover:bg-muted/50 focus-visible:border-input focus-visible:bg-background sm:text-2xl"
                />
            </div>

            {/* Metadata fields */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
                <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Key</span>
                    <Select value={key || NO_KEY} onValueChange={(value) => setKey(value === NO_KEY ? "" : String(value))}>
                        <SelectTrigger size="sm" className="w-40" aria-label="Key of the song">
                            <SelectValue>
                                {(value: string) =>
                                    value === NO_KEY ? (
                                        <span className="text-muted-foreground">Not set</span>
                                    ) : (
                                        value
                                    )
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_KEY}>Not set</SelectItem>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>Major</SelectLabel>
                                {MAJOR_KEY_LABELS.map((label) => (
                                    <SelectItem key={label} value={label}>{label}</SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>Minor</SelectLabel>
                                {MINOR_KEY_LABELS.map((label) => (
                                    <SelectItem key={label} value={label}>{label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Capo</span>
                    <Select value={String(capo)} onValueChange={(value) => setCapo(Number(value))}>
                        <SelectTrigger size="sm" className="w-32" aria-label="Capo fret">
                            <SelectValue>
                                {(value: string) => (value === "0" ? "None" : `Fret ${value}`)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {CAPO_OPTIONS.map((fret) => (
                                <SelectItem key={fret} value={String(fret)}>
                                    {fret === 0 ? "None" : `Fret ${fret}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="flex min-w-32 flex-1 flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Tempo</span>
                    <Input
                        value={tempo}
                        onChange={(event) => setTempo(event.target.value)}
                        placeholder="92 BPM"
                        aria-label="Tempo"
                        className="h-8"
                    />
                </label>

                <Button variant="outline" size="sm" onClick={handleDetectKey}>
                    <WandSparklesIcon />
                    Detect key
                </Button>

                {key && capo > 0 && (
                    <p className="basis-full text-xs text-muted-foreground">
                        Key: {key} · Sounds in {soundingKey(key, capo)} · Capo {capo}
                    </p>
                )}

                {suggestion?.key && (
                    <div className="flex basis-full flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5">
                        <SparklesIcon className="size-3.5 text-primary" />
                        <span className="text-xs text-foreground">
                            Suggested key: <b>{suggestion.key}</b>
                            <span className="text-muted-foreground"> · {suggestion.confidence} confidence</span>
                        </span>
                        <Button
                            size="xs"
                            onClick={() => {
                                setKey(suggestion.key as string);
                                setSuggestion(null);
                            }}
                        >
                            Apply
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setSuggestion(null)}
                            aria-label="Dismiss suggestion"
                        >
                            <XIcon />
                        </Button>
                    </div>
                )}
            </div>

            {/* View toggle and save */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-lg bg-muted p-0.5" role="tablist" aria-label="Editor view">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === "edit"}
                        onClick={() => setView("edit")}
                        className={
                            view === "edit"
                                ? "cursor-pointer rounded-md bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm"
                                : "cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        }
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === "preview"}
                        onClick={() => setView("preview")}
                        className={
                            view === "preview"
                                ? "cursor-pointer rounded-md bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm"
                                : "cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        }
                    >
                        Preview
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {dirty && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Badge variant="secondary">Unsaved</Badge>
                            Changes are not stored yet
                        </span>
                    )}
                    <Button onClick={() => void handleSave()} disabled={isSaving}>
                        {isSaving ? <Spinner variant="primary" /> : null}
                        Save
                    </Button>
                </div>
            </div>

            {view === "preview" && (
                <div className="flex flex-wrap items-center gap-3">
                    <TransposeBar
                        originalKey={key || undefined}
                        semitones={previewSemitones}
                        onChange={setPreviewSemitones}
                    />
                    <span className="text-xs text-muted-foreground">
                        Transposition is temporary; the saved sheet never changes.
                    </span>
                </div>
            )}

            {/* Editor / preview and the chords rail */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    {view === "edit" ? (
                        <>
                            {blocks.map((block, index) => (
                                <SectionBlockEditor
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    total={blocks.length}
                                    onChange={(patch) => updateBlock(block.id, patch)}
                                    onMove={(direction) => moveBlock(block.id, direction)}
                                    onRemove={() => removeBlock(block.id)}
                                    onFocus={() => { activeBlockId.current = block.id; }}
                                    textareaRef={(element) => { textareaRefs.current[block.id] = element; }}
                                />
                            ))}

                            <Button variant="outline" size="sm" onClick={addBlock} className="self-start">
                                <PlusIcon />
                                Add section
                            </Button>
                        </>
                    ) : (
                        <ChordSheet
                            content={serializedContent}
                            semitones={previewSemitones}
                            originalKey={key || undefined}
                        />
                    )}
                </div>

                <ChordsRail
                    content={serializedContent}
                    onInsert={insertChord}
                    className="lg:w-80 lg:shrink-0"
                />
            </div>

            {/* Unsaved-changes guard */}
            <AlertDialog
                open={blocker.state === "blocked"}
                onOpenChange={(open) => {
                    if (!open)
                        blocker.reset?.();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This chord sheet has unsaved changes. If you leave now, they will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Stay here</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => blocker.proceed?.()}
                        >
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
