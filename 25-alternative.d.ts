// This the first solution I came with, but when is moddified to works with the () => of JSONParserValue it return Type instantiation too deep
import type { Expect, Equal } from "type-testing";
type GenericFunctionResult = (...x: never[]) => Result;
type GenericFunction = (...x: never[]) => unknown;
type Assume<T, U> = T extends U ? T : U;

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

interface Parser {
	readonly _1?: unknown;
	readonly _2?: unknown;
	readonly _partial?: unknown;
	readonly _only?: unknown;
	return: GenericFunctionResult;
}

type Parse<F extends Parser, _1> = F extends Mapper
	? ReturnType<
			(F & {
				readonly data: _1;
			})["map"]
		>
	: F["_partial"] extends boolean
		? ReturnType<
				(F & {
					readonly _2: _1;
				})["return"]
			>
		: F["_only"] extends boolean
			? ReturnType<
					(F & {
						readonly _2: _1;
					})["return"]
				>
			: F & {
					readonly _1: _1;
					readonly _partial: true;
				};

interface UniqueParser extends Parser {
	data: unknown;
	map: GenericFunction;
}

interface Just extends Parser {
	return: () => this["_2"] extends `${infer FirstChar}${infer Rest}`
		? FirstChar extends this["_1"]
			? Success<[FirstChar], Rest>
			: Fail<[], this["_2"]>
		: Fail<[], this["_2"]>;
}

interface Many1 extends Parser {
	return: (x: Assume<this["_1"], Parser>) => Many1Impl<typeof x, this["_2"]>;
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

interface Many0 extends Parser {
	return: (x: Assume<this["_1"], Parser>) => MakeSuccess<Many1Impl<typeof x, this["_2"]>>;
}

interface Pair extends Parser {
	return: (
		x: Assume<this["_1"], Parser[]>,
	) => Parse<(typeof x)[0], this["_2"]> extends infer R extends Result
		? R extends Success
			? Parse<(typeof x)[1], R["rest"]> extends infer R2 extends Result
				? MergeResults<ChangeDataResult<R, [R["data"]]>, ChangeDataResult<R2, [R2["data"]]>>
				: never
			: R
		: never;
}
interface Pair1 extends Parser {
	return: (
		x: Assume<this["_1"], Parser[]>,
	) => Parse<(typeof x)[0], this["_2"]> extends infer R extends Result
		? R extends Success
			? Parse<(typeof x)[1], R["rest"]> extends infer R2 extends Result
				? MergeResults<ChangeDataResult<R, [R["data"]]>, ChangeDataResult<R2, [R2["data"]]>>
				: never
			: R
		: never;
}
interface Maybe extends Parser {
	return: (x: Assume<this["_1"], Parser>) => MakeMaybe<Parse<typeof x, this["_2"]>>;
}

interface Seq extends Parser {
	return: (x: Assume<this["_1"], Parser[]>) => SeqImpl<typeof x, Success<[], this["_2"]>>;
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

interface Choice extends Parser {
	return: (x: Assume<this["_1"], Parser[]>) => ChoiceImpl<typeof x, this["_2"]>;
}
type ChoiceImpl<Fns extends Parser[], Content> = Fns extends [
	infer Fn extends Parser,
	...infer Rest extends Parser[],
]
	? Parse<Fn, Content> extends infer A
		? A extends Success
			? A
			: Rest extends []
				? A
				: ChoiceImpl<Rest, Content>
		: never
	: never;

interface SepBy0 extends Parser {
	return: (
		x: Assume<this["_1"], [Parser, Parser]>,
	) => SepBy0Impl<(typeof x)[0], (typeof x)[1], this["_2"]>;
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
		? SepBy0Impl<Fn, Separator, Rest, "", [...Acc, Parse<Fn, AccString>]>
		: SepBy0Impl<Fn, Separator, Rest, `${AccString}${Item extends " " ? "" : Item}`, Acc>
	: MergeAllRecords<[...Acc, Parse<Fn, AccString>]>;

type LeftImpl<
	Fn extends Parser,
	Content,
	LeftSide extends string = "",
> = Content extends `${infer Item}${infer Rest}`
	? Parse<Fn, Item> extends Fail
		? LeftImpl<Fn, Rest, `${LeftSide}${Item}`>
		: [data: LeftSide, rest: Rest]
	: [data: `${LeftSide}${Content extends string ? Content : ""}`, rest: ""];

interface Left extends Parser {
	return: (
		x: Assume<this["_1"], [Parser, Parser]>,
	) => Parse<(typeof x)[0], this["_2"]> extends infer R1 extends Result
		? R1 extends Success
			? Parse<(typeof x)[1], R1["rest"]> extends infer R2 extends Result
				? R2 extends Success
					? ChangeDataResult<R1, R1["data"], R2["rest"]>
					: R2
				: never
			: R1
		: never;
}
type ReverseString<Content, Acc extends string = ""> = Content extends `${infer Item}${infer Rest}`
	? ReverseString<Rest, `${Item}${Acc}`>
	: Acc;

interface Right extends Parser {
	return: (
		x: Assume<this["_1"], [Parser, Parser]>,
	) => Parse<(typeof x)[0], this["_2"]> extends infer R1 extends Result
		? R1 extends Success
			? Parse<(typeof x)[1], R1["rest"]>
			: R1
		: never;
}

interface NoneOf extends Parser {
	return: () => this["_2"] extends `${infer FirstChar}${infer Rest}`
		? FirstChar extends this["_1"]
			? Fail<[FirstChar], Rest>
			: Success<[], this["_2"]>
		: Success<[], this["_2"]>;
}

interface EOF extends Parser {
	_only: true;
	return: () => this["_2"] extends "" ? Success<[], ""> : Fail<[], this["_2"]>;
}

interface Mapper extends Parser {
	data: unknown;
	map: GenericFunction;
}

interface MapResult extends Parser {
	return: (
		x: Assume<this["_1"], [Parser & { _partial: true }, ...Mapper[]]>,
		y: Assume<this["_2"], string>,
	) => MapResultImpl<GetTail<typeof x>, Parse<GetHead<typeof x>, typeof y>>;
}
type GetTail<Arr extends unknown[]> = Arr extends [infer Head, ...infer Rest] ? Rest : never;
type GetHead<Arr extends unknown[]> = Arr extends [infer Head, ...infer Rest] ? Head : never;
type MapResultImpl<Fns extends Mapper[], Acc extends Result> = Fns extends [
	infer Fn extends Mapper,
	...infer Rest extends Mapper[],
]
	? MapResultImpl<Rest, ChangeDataResult<Acc, Parse<Fn, Acc["data"]>>>
	: Acc;
