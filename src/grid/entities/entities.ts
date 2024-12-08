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

export class FileInputs {
    fileA: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
    fileB: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
}

export const colourDifferenceDictionary = {
    'A': '#17a2b8',
    'B': '#28a746'
};