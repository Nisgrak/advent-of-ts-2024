type AnalyzeScope<
	Script extends string,
	Acc extends { declared: string[]; used: string[] } = { declared: []; used: [] },
> = Script extends `${infer A}${infer Rest}`
	? A extends " " | "\n" | "\t" | "\r"
		? AnalyzeScope<Rest, Acc>
		: Script extends `${infer VarType extends
					| "let"
					| "const"
					| "var"} ${infer VarName} = "${infer VarValue}";${infer Rest}`
			? AnalyzeScope<Rest, { declared: [...Acc["declared"], VarName]; used: Acc["used"] }>
			: Script extends `${infer FunctionName}(${infer Argument})${infer Rest}`
				? AnalyzeScope<Rest, { declared: Acc["declared"]; used: [...Acc["used"], Argument] }>
				: Acc
	: Acc;
