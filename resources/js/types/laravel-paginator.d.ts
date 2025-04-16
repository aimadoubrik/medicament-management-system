// Adjust this interface based on the actual data structure
// returned by your Laravel backend paginator's ->toJson() or resource.
export interface LaravelPaginator<TData> {
    data: TData[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Simple Paginator structure if you are using ->simplePaginate()
export interface LaravelSimplePaginator<TData> {
    data: TData[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    // Note: simplePaginate does NOT typically include last_page or total
}
