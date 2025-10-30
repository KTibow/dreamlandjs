import { CssInit } from "../css";
import { Pointer } from "../state/pointers";
import { Stateful } from "../state/state";

export type ComponentChild =
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ComponentChild[]
	| Pointer<ComponentChild>;

export type ComponentContext<T = any> = {
	state: Stateful<T>;

	root: HTMLElement;

	children: ComponentChild[];

	id?: string;

	// Run only on client
	mount?: () => void;
	// Run on client and server
	init?: () => void;
};

type MappedProps<Props> = {
	[Key in keyof Props]: Props[Key] | Pointer<Props[Key]>;
};
type Empty = Record<string, never>;
export type Component<Private extends object = Empty, Props extends object = Empty> = {
	style?: CssInit;
	(this: Stateful<Private>, props: Stateful<Props>, cx: ComponentContext<Props>): HTMLElement;
};

// Omit<Type, Keys> is stupid and breaks callables like `on:click`
type StateObj<Props, Private> = {
	[P in keyof (Props & Private) as Exclude<P, "children">]: (Props &
		Private)[P];
};

type ComponentStateObj<T extends Component<any, any>> =
	T extends Component<infer Props, infer Private>
		? StateObj<Props, Private>
		: never;
export type ComponentState<T extends Component<any, any>> = Stateful<
	ComponentStateObj<T>
>;
export type ComponentInstance<T extends Component<any, any>> = DLElement<
	ComponentStateObj<T>
>;
export type DLElement<T extends object> = HTMLElement & {
	$: ComponentContext<T>;
};

type IntrinsicProps<ElementType extends Element> = {
	this?: Pointer<ElementType | Element | null | undefined>;
	children?: any;
	[key: `class:${string}`]: Pointer<boolean> | boolean;
	[key: `on:${string}`]: (e: any) => void;
	[key: string]: any;
};

type DLElementTagNames = HTMLElementTagNameMap &
	HTMLElementDeprecatedTagNameMap &
	Pick<
		SVGElementTagNameMap,
		Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
	>;
export type DLElementNameToElement<T extends string> =
	T extends keyof DLElementTagNames ? DLElementTagNames[T] : HTMLElement;
type GlobalElement = Element;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
	export type IntrinsicElements = {
		[El in keyof DLElementTagNames]: IntrinsicProps<DLElementTagNames[El]>;
	} & {
		[element: string]: IntrinsicProps<GlobalElement>;
	};

	export type ElementType = keyof IntrinsicElements | Component<any, any>;
	export type Element = HTMLElement;
	export type LibraryManagedAttributes<C, _> =
		C extends Component<any, infer Props> ? MappedProps<Props> : never;
}
