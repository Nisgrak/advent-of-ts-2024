type GenericFunctionResult = (...x: never[]) => Result;
type GenericFunction = (...x: never[]) => unknown;
type Assume<T, U> = T extends U ? T : U;

interface Parser {
	operation?: string;
	_1?: unknown;
	_partial?: unknown;
	_only?: unknown;
	(): Parser & { operation: string };
}

type Result = Success | Fail | MaybeResult;
type Success<Data = any, Rest = any> = {
	data: Data;
	success: true;
	rest: Rest;
};
type Fail<Data = any, Rest = any> = {
	data: Data;
	success: false;
	rest: Rest;
};
type MaybeResult<Data = any, Rest = any, Result = any> = {
	data: Data;
	success: Result;
	rest: Rest;
	optional: true;
};
type MakeSuccess<Acc extends Result> = Success<Acc["data"], Acc["rest"]>;
type MakeMaybe<Acc extends Result> = MaybeResult<Acc["data"], Acc["rest"], Acc["success"]>;
type ChangeDataResult<
	Acc extends Result,
	NewData = Acc["data"],
	NewRest = Acc["rest"],
> = Acc extends Success ? Success<NewData, NewRest> : Fail<NewData, NewRest>;
type MergeResults<Old extends Result, New extends Result> = Old extends Success
	? ChangeDataResult<
			New,
			Old["data"] extends [] ? New["data"] : [...Old["data"], ...New["data"]],
			New["rest"]
		>
	: Old;

type Parse<F extends Parser, value> = F extends Mapper
	? ReturnType<
			(F & {
				readonly data: value;
			})["map"]
		>
	: F["operation"] extends string
		? F["_partial"] extends boolean
			? F extends { operation: "Just" }
				? value extends `${infer FirstChar}${infer Rest}`
					? FirstChar extends F["_1"]
						? Success<[FirstChar], Rest>
						: Fail<[], value>
					: Fail<[], value>
				: F extends { operation: "Many1" }
					? Many1Impl<Assume<F["_1"], Parser>, value>
					: F extends { operation: "MapResult" }
						? Parse<
								GetHead<Assume<F["_1"], [Parser & { _partial: true }, ...Mapper[]]>>,
								Assume<value, string>
							> extends infer X extends Result
							? MapResultImpl<
									GetTail<Assume<F["_1"], [Parser & { _partial: true }, ...Mapper[]]>>,
									X
								>
							: never
						: F extends { operation: "Many0" }
							? MakeSuccess<Many1Impl<Assume<F["_1"], Parser>, value>>
							: F extends { operation: "Left" }
								? Parse<Assume<F["_1"], [Parser, Parser]>[0], value> extends infer R1 extends Result
									? R1 extends Success
										? Parse<
												Assume<F["_1"], [Parser, Parser]>[1],
												R1["rest"]
											> extends infer R2 extends Result
											? R2 extends Success
												? ChangeDataResult<R1, R1["data"], R2["rest"]>
												: R2
											: never
										: R1
									: never
								: F extends { operation: "Right" }
									? Parse<Assume<F["_1"], [Parser, Parser]>[0], value> extends infer R1 extends
											Result
										? R1 extends Success
											? Parse<
													Assume<F["_1"], [Parser, Parser]>[1],
													R1["rest"]
												> extends infer R2 extends Result
												? R2
												: never
											: R1
										: never
									: F extends { operation: "Choice" }
										? ChoiceImpl<Assume<F["_1"], Parser[]>, value>
										: F extends { operation: "NoneOf" }
											? value extends `${infer FirstChar}${infer Rest}`
												? FirstChar extends F["_1"]
													? Fail<[FirstChar], Rest>
													: Success<[], value>
												: Success<[], value>
											: F extends { operation: "EOF" }
												? value extends ""
													? Success<[], "">
													: Fail<[], value>
												: F extends { operation: "Seq" }
													? SeqImpl<Assume<F["_1"], Parser[]>, Success<[], value>>
													: F extends { operation: "Maybe" }
														? Parse<Assume<F["_1"], Parser>, value> extends infer X extends Result
															? MakeMaybe<X>
															: never
														: F extends { operation: "SepBy0" }
															? SepBy0Impl<
																	Assume<F["_1"], [Parser, Parser]>[0],
																	Assume<F["_1"], [Parser, Parser]>[1],
																	value
																>
															: F extends { operation: "Pair" }
																? Parse<Assume<F["_1"], Parser[]>[0], value> extends infer R extends
																		Result
																	? R extends Success
																		? Parse<
																				Assume<F["_1"], Parser[]>[1],
																				R["rest"]
																			> extends infer R2 extends Result
																			? MergeResults<
																					ChangeDataResult<R, [R["data"]]>,
																					ChangeDataResult<R2, [R2["data"]]>
																				>
																			: never
																		: R
																	: never
																: never
			: F & { _partial: true; _1: value }
		: Parse<ReturnType<F>, value>;

interface Just extends Parser {
	operation: "Just";
}

interface Many1 extends Parser {
	operation: "Many1";
}

type Many1Impl<
	Fn extends Parser,
	Text,
	Acc extends Result = Fail<[], Text>,
> = Acc["rest"] extends `${infer Char1}${infer Rest}`
	? Parse<Fn, Char1> extends infer CResult extends Result
		? CResult extends Success
			? Many1Impl<Fn, "", Success<[...Acc["data"], Char1], Rest>>
			: Acc extends Success
				? Success<Acc["data"], `${Char1}${Rest}`>
				: Fail<Acc["data"], `${Char1}${Rest}`>
		: Acc
	: Acc;

interface MapResult extends Parser {
	operation: "MapResult";
}
type GetTail<Arr extends unknown[]> = Arr extends [infer Head, ...infer Rest] ? Rest : never;
type GetHead<Arr extends unknown[]> = Arr extends [infer Head, ...infer Rest] ? Head : never;
type MapResultImpl<Fns extends Mapper[], Acc extends Result> = Fns extends [
	infer Fn extends Mapper,
	...infer Rest extends Mapper[],
]
	? MapResultImpl<Rest, ChangeDataResult<Acc, Parse<Fn, Acc["data"]>>>
	: Acc;

interface Mapper extends Parser {
	data: unknown;
	map: GenericFunction;
}

interface Many0 extends Parser {
	operation: "Many0";
}

interface Left extends Parser {
	operation: "Left";
}

interface Right extends Parser {
	operation: "Right";
}

interface Choice extends Parser {
	operation: "Choice";
}
type ChoiceImpl<Fns extends Parser[], Content> = Fns extends [
	infer Fn extends Parser,
	...infer Rest extends Parser[],
]
	? Parse<Fn, Content> extends infer A extends Result
		? A extends Success
			? A
			: Rest extends []
				? A
				: ChoiceImpl<Rest, Content>
		: never
	: never;

interface NoneOf extends Parser {
	operation: "NoneOf";
}

interface EOF extends Parser {
	_partial: true;
	operation: "EOF";
}

interface Seq extends Parser {
	operation: "Seq";
}

type SeqImpl<Fns extends Parser[], Acc extends Result> = Fns extends [
	infer Fn extends Parser,
	...infer Rest extends Parser[],
]
	? Parse<Fn, Acc["rest"]> extends infer A extends Result
		? A extends MaybeResult
			? SeqImpl<Rest, MergeResults<Acc, MakeSuccess<A>>>
			: A extends Success
				? SeqImpl<Rest, MergeResults<Acc, A>>
				: MergeResults<Acc, A>
		: never
	: Acc;

interface Maybe extends Parser {
	operation: "Maybe";
}

interface SepBy0 extends Parser {
	operation: "SepBy0";
}
type MergeAllRecords<
	Content extends Result[],
	Acc extends [Result, unknown[]] = [Success<[], "">, []],
> = Content extends [infer R1 extends Result, ...infer Rest extends Result[]]
	? MergeAllRecords<Rest, [MergeResults<Acc[0], R1>, [...Acc[1], R1["data"]]]>
	: ChangeDataResult<Acc[0], Acc[1]>;
type SepBy0Impl<
	Fn extends Parser,
	Separator extends Parser,
	Content,
	AccString extends string = "",
	Acc extends Result[] = [],
> = Content extends `${infer Item}${infer Rest}`
	? Parse<Separator, `${Item} `> extends infer R1 extends Success
		? Parse<Fn, AccString> extends infer X extends Result
			? SepBy0Impl<Fn, Separator, Rest, "", [...Acc, X]>
			: never
		: SepBy0Impl<Fn, Separator, Rest, `${AccString}${Item extends " " ? "" : Item}`, Acc>
	: Parse<Fn, AccString> extends infer X extends Result
		? MergeAllRecords<[...Acc, X]>
		: never;

interface Pair extends Parser {
	operation: "Pair";
}
