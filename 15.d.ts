type GetRoute<
	T extends string,
	Acc extends string[] = [],
	Result extends [string, number][] = [],
> = T extends ""
	? Result
	: T extends `-${infer Rest}`
		? Result["length"] extends 0
			? GetRoute<Rest, [...Acc], Result>
			: GetRoute<Rest, [...Acc, ""], Result>
		: T extends `${infer A}-${infer Rest}`
			? A extends ""
				? GetRoute<Rest, [...Acc, ""], Result>
				: A extends "-"
					? GetRoute<Rest, [], Result>
					: GetRoute<Rest, [""], [...Result, [A, Acc["length"]]]>
			: [...Result, [T, Acc["length"]]];
