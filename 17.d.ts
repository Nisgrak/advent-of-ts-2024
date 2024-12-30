const compose =
	<X, T, C, B>(f: (x: X) => C, g: (x: C) => B, h: (x: B) => T) =>
	(a: X): T =>
		h(g(f(a)));

const upperCase = <T extends string>(x: T) => x.toUpperCase() as Uppercase<T>;
const lowerCase = <T extends string>(x: T) => x.toLowerCase() as Lowercase<T>;
const firstChar = <T extends string>(x: T): T extends `${infer A}${infer Rest}` ? A : never =>
	x[0] as any;
const firstItem = <T,>(x: T[]) => x[0];
const makeTuple = <T,>(x: T) => [x];
const makeBox = <T,>(value: T) => ({ value });
