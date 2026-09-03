import type {
  CellData,
  RowData,
  TableFeatures,
} from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData,
  > {
    className?: string
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
