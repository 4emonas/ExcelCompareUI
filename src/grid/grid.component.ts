import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpHeaders, HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridModule } from 'ag-grid-angular';
import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';
import { GridFileReader } from './grid.fileReader';
import { RouterOutlet } from '@angular/router';

export interface File {
    content: string,
    rowData: any[],
    columns: ColDef[],
    readFinish: boolean | undefined
}

interface CompareApiResponse {
    result: {
        cellsOnlyInFileA: string[],
        cellsOnlyInFileB: string[],
        cellsWithDifferentValues: string[]
    }
}

class CompareResultCoords {
    cellsOnlyInFileA: Coords[] = [];
    cellsOnlyInFileB: Coords[] = [];
    cellsWithDifferentValues: Coords[] = [];
}

export interface Coords {
    x: number,
    y: number
}

@Component({
    selector: "grid-app",
    standalone: true,
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
    imports: [RouterOutlet, HttpClientModule, MatProgressSpinnerModule, CommonModule, AgGridModule]
})
export class GridComponent implements OnInit {
    constructor(private httpClient: HttpClient) { }

    ngOnInit(): void {
        let gridFileA = document.querySelector<HTMLElement>("#myGridFileA")!;
        let gridFileB = document.querySelector<HTMLElement>("#myGridFileB")!;
        this.gridApiA = createGrid(gridFileA, this.gridOptionsFileA);
        this.gridApiB = createGrid(gridFileB, this.gridOptionsFileB);
    }

    gridApiA: GridApi<any>;
    gridApiB: GridApi<any>;
    SERVER_URL = "https://localhost:7079/";
    CompareApi = "Compare";
    fileA: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
    fileB: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
    diffs = new CompareResultCoords();
    test: any;

    gridOptionsFileA: GridOptions<any> = {
        columnDefs: this.fileA.columns,
        rowData: this.fileA.rowData,
        defaultColDef: {
            initialWidth: 100,
        },
        columnTypes: {
            a: {
                cellStyle: (params) => {
                    let i = params.rowIndex;
                    let j = this.gridApiA.getAllDisplayedColumns().indexOf(params.column);
                    let coords: Coords = { x: i+1, y:j+1 };
                    if (this.diffs.cellsOnlyInFileA.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#4cbfed" };
                    }

                    if (this.diffs.cellsWithDifferentValues.some(t => t.x === coords.x && t.y === coords.y)){
                        return { backgroundColor: "#db1630" }
                    }

                    return;
                }
            }
        }
    };

    gridOptionsFileB: GridOptions<any> = {
        columnDefs: this.fileB.columns,
        rowData: this.fileB.rowData,
        defaultColDef: {
            initialWidth: 100,
        },
        columnTypes: {
            a: {
                cellStyle: (params) => {
                    let i = params.rowIndex;
                    let j = this.gridApiB.getAllDisplayedColumns().indexOf(params.column);
                    let coords: Coords = { x: i+1, y:j+1 };
                    if (this.diffs.cellsOnlyInFileB.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#4ced77" };
                    }

                    if (this.diffs.cellsWithDifferentValues.some(t => t.x === coords.x && t.y === coords.y)){
                        return { backgroundColor: "#db1630" }
                    }
                    
                    return;
                }
            }
        }
    };

    async readExcelFileA(e: any) {
        console.log('a');
        GridFileReader.readExcelFile(e, this.fileA, this.gridApiA);
    }

    async readExcelFileB(e: any) {
        GridFileReader.readExcelFile(e, this.fileB, this.gridApiB);
    }

    public compare() {
        if (!this.fileA.readFinish || !this.fileB.readFinish) {
            alert('files are not fully loaded yet');
            return;
        }

        this.uploadFile(this.fileA.content, this.fileB.content);
    }

    uploadFile(fileA: string, fileB: string) {
        const formData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'accept': 'text/plain' })
        };

        formData.append('file', "file");
        var files = [fileA, fileB];
        this.httpClient.post<CompareApiResponse>(this.SERVER_URL + this.CompareApi, JSON.stringify(files), httpOptions).subscribe(response => {
            this.parseApiResponse(response, this.diffs);
            this.highlightDiffs(this.diffs);
        });
    }

    highlightDiffs(diffs: CompareResultCoords) {
        this.gridApiA.redrawRows();
        this.gridApiB.redrawRows();
    }

    parseApiResponse(apiResponse: CompareApiResponse, diffs: CompareResultCoords) {
        console.log(apiResponse.result.cellsOnlyInFileA);
        this.parseResults(apiResponse.result.cellsOnlyInFileA, diffs.cellsOnlyInFileA);
        console.log(diffs.cellsOnlyInFileA);
        this.parseResults(apiResponse.result.cellsOnlyInFileB, diffs.cellsOnlyInFileB);
        this.parseResults(apiResponse.result.cellsWithDifferentValues, diffs.cellsWithDifferentValues);
    }

    parseResults(from: string[], to: Coords[]) {
        from.map(i => {
            let t = i.match(/[a-zA-Z]+|[0-9]+/g);
            let coords: Coords = { x: -1, y: -1 };
            coords.x = Number(t![1]);
            coords.y = GridFileReader.colNameToNumber(t![0]);

            if (coords.x >= 0 && coords.y >= 0) {
                to.push(coords)
            }
        });
    }
}

