import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';

export interface File {
    content: string,
    rowData: any[],
    columns: ColDef[],
    readFinish: boolean | undefined
}

export interface Coords {
    x: number,
    y: number
}

export class CompareResultCoords {
    cellsOnlyInFileA: Coords[] = [];
    cellsOnlyInFileB: Coords[] = [];
    cellsWithDifferentValues: Coords[] = [];
}