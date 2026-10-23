/**
 * Generates src/lib/chords/guitar-chords.json from the chords-db dataset.
 *
 * The dataset (MIT, github.com/tombatossals/chords-db) holds several shapes
 * per chord; this script keeps the most idiomatic one (a first-position
 * shape when available) for every root and quality offered by the library.
 *
 * Run from the frontend folder: pnpm run build:chords-db
 * The generated file is committed, so the app never needs network access.
 */

import { readFile, writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/tombatossals/chords-db/master/lib/guitar.json";
const QUALITIES_PATH = new URL("../src/lib/chords/qualities.json", import.meta.url);
const OUTPUT_PATH = new URL("../src/lib/chords/guitar-chords.json", import.meta.url);

const qualities = JSON.parse(await readFile(QUALITIES_PATH, "utf8"));

const response = await fetch(SOURCE);

if (!response.ok)
    throw new Error(`chords-db download failed: ${response.status} ${response.statusText}`);

const dataset = await response.json();

/** Picks the most idiomatic position of a suffix: open/first position first. */
const pickPosition = (entries, dbSuffix) => {
    const positions = entries
        .filter((entry) => entry.suffix === dbSuffix)
        .flatMap((entry) => entry.positions ?? [])
        .filter((position) => Array.isArray(position.frets) && position.frets.length === 6);

    if (positions.length === 0)
        return null;

    return positions.find((position) => (position.baseFret ?? 1) === 1) ?? positions[0];
};

const book = {};

for (const [dbKey, entries] of Object.entries(dataset.chords)) {
    const shapes = {};

    for (const quality of qualities) {
        const position = pickPosition(entries, quality.dbSuffix);

        if (!position)
            continue;

        shapes[quality.dbSuffix] = {
            frets: position.frets,
            fingers: position.fingers ?? [],
            barres: position.barres ?? [],
            baseFret: position.baseFret ?? 1,
        };
    }

    book[dbKey] = shapes;
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(book, null, 2)}\n`);

const roots = Object.keys(book).length;
const shapes = Object.values(book).reduce((total, entry) => total + Object.keys(entry).length, 0);

console.log(`guitar-chords.json written: ${roots} roots x ${qualities.length} qualities (${shapes} shapes)`);
