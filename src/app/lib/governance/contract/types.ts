export type MichelsonPeriodEnumType = {
  readonly proposal: Symbol;
} | {
  readonly promotion: Symbol;
}

export type MichelsonOptional<T> = {
  Some: T
} | null
