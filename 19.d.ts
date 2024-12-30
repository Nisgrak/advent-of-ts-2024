type Parse<
	Script extends string,
	Acc extends { type: string; id?: string; argument?: string }[] = [],
> = Script extends `${infer A}${infer Rest}`
	? A extends " " | "\n" | "\t" | "\r"
		? Parse<Rest, Acc>
		: Script extends `${infer VarType extends
					| "let"
					| "const"
					| "var"} ${infer VarName} = "${infer VarValue}";${infer Rest}`
			? Parse<
					Rest,
					[
						...Acc,
						{
							id: VarName;
							type: "VariableDeclaration";
						},
					]
				>
			: Script extends `${infer A}${infer FunctionName}(${infer Argument})${infer Rest}`
				? Parse<
						Rest,
						[
							...Acc,
							{
								argument: Argument;
								type: "CallExpression";
							},
						]
					>
				: Acc
	: Acc;
