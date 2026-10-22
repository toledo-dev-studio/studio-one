import type { PropsWithChildren } from "react";

import { Loader } from "@/shared/components/loader/Loader";
import { useLoaderStore } from "@/stores/LoaderStore";

/**
 * Displays the global loader while any async action is running.
 */
export const LoaderContextProvider = ({ children }: PropsWithChildren) => {

    const { isLoading, title, subTitle } = useLoaderStore();

    return (
        <>
            {isLoading && <Loader className="fixed" title={title!} subtitle={subTitle} />}
            {children}
        </>
    );
};
