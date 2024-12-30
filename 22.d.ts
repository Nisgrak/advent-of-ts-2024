type WhitespaceCleaner<Content extends string> = Content extends `${infer A extends
	| " "
	| "\n"
	| "\t"
	| "\r"}${infer Rest}`
	? WhitespaceCleaner<Rest>
	: Content;

type ClearComillasTest<T extends string> = T extends `${infer Before}"${infer Rest}`
	? `${Before}'${ClearComillasTest<Rest>}`
	: T;

type ClearComillas<T extends string> = T extends `${infer Before}\"${infer Rest}`
	? `${Before}"${ClearBars<Rest>}`
	: T;

type ClearBars<T extends string> = T extends `${infer Before}\\r${infer Rest}`
	? `${Before}\r${ClearBars<Rest>}`
	: T extends `${infer Before}\\n${infer Rest}`
		? `${Before}\n${ClearBars<Rest>}`
		: T extends `${infer Before}\\b${infer Rest}`
			? `${Before}\b${ClearBars<Rest>}`
			: T extends `${infer Before}\\f${infer Rest}`
				? `${Before}\f${ClearBars<Rest>}`
				: T;

type MergeObject<Object1 extends Record<string, any>, Object2 extends Record<string, any>> = {
	[K in keyof Object1 | keyof Object2]: K extends keyof Object1
		? Object1[K]
		: K extends keyof Object2
			? Object2[K]
			: never;
};

type MakeObject<Keya extends string | number, Value extends any> = {
	[K in Keya]: Value extends string ? TypeParser<Value> : Value;
};

type TypeParser<
	Content extends string,
	Cleared = WhitespaceCleaner<Content>,
> = Cleared extends "true"
	? true
	: Cleared extends "false"
		? false
		: Cleared extends "null"
			? null
			: Cleared extends number
				? Cleared
				: Cleared extends `${infer Result extends number}`
					? Result
					: Cleared extends `\"${infer Result}\"`
						? Result
						: Cleared;

type ArrayParser<
	Content extends string,
	Acc extends any[] = [],
	IncludeLast extends boolean = false,
	Cleared = WhitespaceCleaner<Content>,
> = Content extends ""
	? Acc
	: Cleared extends `{${infer A}},${infer Rest}`
		? ArrayParser<Rest, [...Acc, ObjectParser<WhitespaceCleaner<A>>], IncludeLast>
		: Cleared extends `${infer A},${infer Rest}`
			? ArrayParser<Rest, [...Acc, TypeParser<A>], IncludeLast>
			: Cleared extends `"${infer A},"${infer Rest}`
				? ArrayParser<Rest, [...Acc, TypeParser<A>], IncludeLast>
				: IncludeLast extends true
					? [...Acc, TypeParser<Content>]
					: Acc;

type ObjectParser<Content extends string, Acc extends Record<string, any> = {}> = Content extends ""
	? Acc
	: Content extends `"${infer A}": ${infer Value extends number},${infer Rest}`
		? ObjectParser<WhitespaceCleaner<Rest>, MergeObject<Acc, MakeObject<A, Value>>>
		: Content extends `"${infer A}": ${infer Value extends boolean},${infer Rest}`
			? ObjectParser<WhitespaceCleaner<Rest>, MergeObject<Acc, MakeObject<A, Value>>>
			: Content extends `"${infer A}": ${infer Value extends null},${infer Rest}`
				? ObjectParser<WhitespaceCleaner<Rest>, MergeObject<Acc, MakeObject<A, Value>>>
				: Content extends `"${infer A}": [${infer Value}],${infer Rest}`
					? ObjectParser<
							WhitespaceCleaner<Rest>,
							MergeObject<Acc, MakeObject<A, ArrayParser<Value, [], false>>>
						>
					: Content extends `"${infer A}": "${infer Value extends string}",${infer Rest}`
						? ObjectParser<
								WhitespaceCleaner<Rest>,
								MergeObject<Acc, MakeObject<ClearBars<A>, Value>>
							>
						: Content extends `${infer A extends number}: "${infer Value}"${infer Rest}`
							? ObjectParser<WhitespaceCleaner<Rest>, MergeObject<Acc, MakeObject<A, Value>>>
							: Content extends `"${infer A}": "${infer Value}"${infer Rest}`
								? ObjectParser<Rest, MergeObject<Acc, MakeObject<A, Value>>>
								: Content extends `"${infer A}": ${infer Value extends boolean}\n${infer Rest}`
									? ObjectParser<WhitespaceCleaner<Rest>, MergeObject<Acc, MakeObject<A, Value>>>
									: Acc;

type Parse<Script extends string> = Script extends `{}`
	? {}
	: Script extends `${infer VarValue extends number}`
		? VarValue
		: Script extends `[]`
			? []
			: Script extends `[${infer ArrayContent}]`
				? ArrayParser<ArrayContent, [], true>
				: Script extends `{${infer ObjectContent}}`
					? ObjectParser<WhitespaceCleaner<ObjectContent>>
					: TypeParser<Script>;
