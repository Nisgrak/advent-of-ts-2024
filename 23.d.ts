type Action = ObjToDiscUnion<{
	Cap: {};
	Push: { data: unknown };
	ApplyAll: { op: Action };
	Extends: { cond: unknown };
	Filter: { fn: unknown };
}>;

/** Apply */
type Apply<Definition extends { operation: Action[keyof Action] } | Action, Value> = [
	Definition,
	Value,
] extends [{ operation: "Cap" }, infer Text extends string]
	? Capitalize<Text>
	: [Definition, Value] extends [
				{ operation: "Push"; data: infer data extends string },
				infer Arr extends string[],
		  ]
		? [...Arr, data]
		: [Definition, Value] extends [
					{ operation: "ApplyAll"; op: infer Op extends Action },
					infer Arr extends string[],
			  ]
			? {
					[i in keyof Arr]: Apply<Op, Arr[i]>;
				}
			: Definition extends { operation: "Extends"; cond: infer Op }
				? Value extends Op
					? true
					: false
				: [Definition, Value] extends [
							{
								operation: "Filter";
								fn: infer Op extends { operation: "Extends"; cond: infer Cond };
							},
							infer Arr extends any[],
					  ]
					? FilterArray<Arr, Op["cond"]>
					: [Definition, Value] extends [Cap, infer Text extends string]
						? Capitalize<Text>
						: [Definition, Value] extends [Push, infer Text extends string]
							? { operation: "Push"; data: Text }
							: [Definition, Value] extends [ApplyAll, infer Text extends Action]
								? { operation: "ApplyAll"; op: Text }
								: [Definition, Value] extends [Extends, infer TypeCheck extends unknown]
									? { operation: "Extends"; cond: TypeCheck }
									: [Definition, Value] extends [Filter, infer Fn extends unknown]
										? { operation: "Filter"; fn: Fn }
										: never;

type t3123_actual = Apply<Apply<Extends, number>, 1>;
/** Push an element to a tuple */
type Push = Extract<Action, { type: "Push" }>;

/** Filter a tuple */
type Filter = Extract<Action, { type: "Filter" }>;

/** Determine if the given type extends another */
type Extends = Extract<Action, { type: "Extends" }>;

/** Apply an operation to all inputs */
type ApplyAll = Extract<Action, { type: "ApplyAll" }>;

/** Capitalize a string */
type Cap = Extract<Action, { type: "Cap" }>;

type ObjToDiscUnion<
	T,
	Disc extends PropertyKey = "type",
	K extends keyof T = keyof T,
> = K extends unknown ? Record<Disc, K> & T[K] : never;

type CapImpl<Text extends string> = Capitalize<Text>;

type FilterArray<Arr extends any[], Condition, Acc extends any[] = []> = Arr extends [
	infer O1,
	...infer Rest,
]
	? O1 extends Condition
		? FilterArray<Rest, Condition, [...Acc, O1]>
		: FilterArray<Rest, Condition, Acc>
	: Acc;
