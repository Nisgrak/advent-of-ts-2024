type GetTextOfRecord<T extends Record<string, string>> = keyof T extends string
	? `${keyof T}: ${T[keyof T]}`
	: never;

type Excuse<T extends Record<string, string>> = {
	new(a: T): GetTextOfRecord<T>;
};
