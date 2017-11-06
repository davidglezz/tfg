export type Callback<E, R> = (e: E, r: R) => void
export type NodeBack<A, E, R> = (a: A, c: Callback<E, R>) => any

export interface ICallback {
  (error?: Error | null, result?: any): void
}
