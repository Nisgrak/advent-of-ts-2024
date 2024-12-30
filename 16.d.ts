type CurriedFunction<P0, R> = {
	(p0: P0): R;
	(): CurriedFunction<P0, R>;
};
type CurriedFunction2<P0, P1, R> = {
	(p0: P0): CurriedFunction<P1, R>;
	(p0: P0, p1: P1): R;
	(): CurriedFunction2<P0, P1, R>;
};
type CurriedFunction3<P0, P1, P2, R> = {
	(p0: P0, p1: P1, p2: P2): R;
	(p0: P0, p1: P1): CurriedFunction<P2, R>;
	(p0: P0): CurriedFunction2<P1, P2, R>;
	(): CurriedFunction3<P0, P1, P2, R>;
};
type CurriedFunction4<P0, P1, P2, P3, R> = {
	(p0: P0, p1: P1, p2: P2, p3: P3): R;
	(p0: P0, p1: P1, p2: P2): CurriedFunction<P3, R>;
	(p0: P0, p1: P1): CurriedFunction2<P2, P3, R>;
	(p0: P0): CurriedFunction3<P1, P2, P3, R>;
	(): CurriedFunction4<P0, P1, P2, P3, R>;
	(x: "Spectacular", y: 0, z: true): "This is just a wrong test";
};

declare function DynamicParamsCurrying<P0, P1, P2, P3, R>(
	fn: (p0: P0, p1: P1, p2: P2, p3: P3) => R,
): CurriedFunction4<P0, P1, P2, P3, R>;
