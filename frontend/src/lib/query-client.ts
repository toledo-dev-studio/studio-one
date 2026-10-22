import { QueryClient } from "@tanstack/react-query";

import { TANSTACK_QUERY_DEFAULTS } from "@/lib/constants/tanstack.constants";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            ...TANSTACK_QUERY_DEFAULTS,
        },
    },
});
