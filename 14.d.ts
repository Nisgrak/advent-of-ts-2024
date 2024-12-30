type PerfReview<T> = T extends AsyncGenerator<infer A> ? A : never;
