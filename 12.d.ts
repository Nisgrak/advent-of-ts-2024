type NaughtyOrNice<
	T extends string,
	Old extends string = "naughty",
> = T extends `${infer A}${infer Rest}`
	? NaughtyOrNice<Rest, Old extends "naughty" ? "nice" : "naughty">
	: Old;

type FormatNames<Row extends [string, string, string][]> = {
	[Key in keyof Row]: {
		name: Row[Key][0];
		count: Row[Key][2] extends `${infer N extends number}` ? N : never;
		rating: NaughtyOrNice<Row[Key][0]>;
	};
};
