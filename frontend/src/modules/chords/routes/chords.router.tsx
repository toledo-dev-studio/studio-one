import { lazy } from "react";
import { type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { ChordDetailPage } from "../pages/detail/ChordDetailPage";
import { ChordEditorPage } from "../pages/editor/ChordEditorPage";
import { ChordsListPage } from "../pages/list/ChordsListPage";

const ChordsLayout = lazy(() => import("@/modules/chords/layouts/ChordsLayout"));

/**
 * Chords module: list of chord sheets, shared editor (create and edit) and
 * the read view of one composition.
 */
export const chordsRouter: RouteObject = {
    path: "/chords",
    element:
        <AuthenticatedRoute>
            <ChordsLayout />
        </AuthenticatedRoute>,
    children: [
        {
            index: true,
            element: <ChordsListPage />
        },
        {
            path: "new",
            element: <ChordEditorPage />
        },
        {
            path: ":id",
            element: <ChordDetailPage />
        }
    ]
};

export default chordsRouter;
