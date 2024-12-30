type Includes<
	Array1 extends string[],
	Array2 extends string[],
	Acc extends string[] = [],
> = Array1 extends [infer Value, ...infer Rest extends string[]]
	? Value extends Array2[number]
		? Includes<Rest, Array2, Acc>
		: Value extends string
			? Includes<Rest, Array2, [...Acc, Value]>
			: never
	: Acc;

type GetNotUsed<Info extends { scope: { declared: string[]; used: string[] }; unused: string[] }> =
	{
		scope: Info["scope"];
		unused: Includes<Info["scope"]["declared"], Info["scope"]["used"]>;
	};

type Lint<
	Script extends string,
	Acc extends { scope: { declared: string[]; used: string[] }; unused: string[] } = {
		scope: { declared: []; used: [] };
		unused: [];
	},
> = Script extends `${infer A}${infer Rest}`
	? A extends " " | "\n" | "\t" | "\r"
		? Lint<Rest, Acc>
		: Script extends `${infer VarType extends
					| "let"
					| "const"
					| "var"} ${infer VarName} = "${infer VarValue}";${infer Rest}`
			? Lint<
					Rest,
					{
						scope: { declared: [...Acc["scope"]["declared"], VarName]; used: Acc["scope"]["used"] };
						unused: Acc["unused"];
					}
				>
			: Script extends `${infer FunctionName}(${infer Argument})${infer Rest}`
				? Lint<
						Rest,
						{
							scope: {
								declared: Acc["scope"]["declared"];
								used: [...Acc["scope"]["used"], Argument];
							};
							unused: Acc["unused"];
						}
					>
				: GetNotUsed<Acc>
	: GetNotUsed<Acc>;
