import { Component, OnInit, HostListener } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';
import { GridFileReader } from './grid.fileReader';
import { environment } from '../environment/environment';
import { FileInputs } from './entities/entities';

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
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
})
export class GridComponent implements OnInit {
    constructor(private httpClient: HttpClient){}
    ngOnInit(): void {
        console.log('GridComponent initialized');
    }

    @HostListener("dragover", ['$event']) onDragOver(event: Event) {
        event.preventDefault();
    }

    @HostListener("drop", ['$event']) onDrop(event: any) {
        event.preventDefault();
        let identifier :string = event.toElement.lastElementChild.innerText;
        if (identifier.indexOf("first")>=0){
            this.readExcelFileA(event.dataTransfer.files);
            return;
        }

        if (identifier.indexOf("second")>=0){
            this.readExcelFileB(event.dataTransfer.files);
            return;
        }
    }

    gridApiA: GridApi<any>;
    gridApiB: GridApi<any>;
    SERVER_URL = environment.api + environment.compareBaseUrl;
    CompareApi = "";
    fileA: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
    fileB: File = { content: '', readFinish: undefined, rowData: [], columns: [] };
    fileInputs = new FileInputs();
    diffs = new CompareResultCoords();

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
                    let coords: Coords = { x: i + 1, y: j + 1 };
                    if (this.diffs.cellsOnlyInFileA.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#17a2b8" };
                    }

                    if (this.diffs.cellsWithDifferentValues.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#ffc107" }
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
                    let coords: Coords = { x: i + 1, y: j + 1 };
                    if (this.diffs.cellsOnlyInFileB.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#28a746" };
                    }

                    if (this.diffs.cellsWithDifferentValues.some(t => t.x === coords.x && t.y === coords.y)) {
                        return { backgroundColor: "#ffc107" }
                    }

                    return;
                }
            }
        }
    };

    async readExcelFileA(e: any) {
        console.log("readExcelFileA");
        let gridFileA = document.querySelector<HTMLElement>("#myGridFileA")!;
        document.querySelector<HTMLElement>("#fileInputA")?.setAttribute("hidden", "true");
        gridFileA.removeAttribute("hidden");
        this.gridApiA = this.gridApiA == undefined ? createGrid(gridFileA, this.gridOptionsFileA) : this.gridApiA;
        if (e.type=="change"){
            GridFileReader.readExcelFile(e.target.files[0], this.fileA, this.gridApiA);
        }else{
            GridFileReader.readExcelFile(e[0], this.fileA, this.gridApiA);
        }
    }

    async readExcelFileB(e: any) {
        console.log("readExcelFileB");
        let gridFileB = document.querySelector<HTMLElement>("#myGridFileB")!;
        document.querySelector<HTMLElement>("#fileInputB")?.setAttribute("hidden", "true");
        gridFileB.removeAttribute("hidden");
        this.gridApiB = this.gridApiB == undefined ? createGrid(gridFileB, this.gridOptionsFileB) : this.gridApiB;
        if (e.type=="change"){
            GridFileReader.readExcelFile(e.target.files[0], this.fileB, this.gridApiB);
        }else{
            GridFileReader.readExcelFile(e[0], this.fileB, this.gridApiB);
        }
    }

    public compare() {
        console.log(this.fileInputs);
        if (!this.fileA.readFinish || !this.fileB.readFinish) {
            alert('files are not fully loaded yet');
            return;
        }

        this.uploadFile(this.fileA.content, this.fileB.content);
    }

    public clearFileA(){
        console.log("clear grid");
        this.diffs = new CompareResultCoords();
        this.highlightDiffs(this.diffs);
        let gridFileA = document.querySelector<HTMLElement>("#myGridFileA")!;
        gridFileA.setAttribute("hidden", "true");
        document.querySelector<HTMLElement>("#fileInputA")?.removeAttribute("hidden");
    }

    public clearFileB(){
        this.diffs = new CompareResultCoords();
        this.highlightDiffs(this.diffs);
        let gridFileA = document.querySelector<HTMLElement>("#myGridFileB")!;
        gridFileA.setAttribute("hidden", "true");
        document.querySelector<HTMLElement>("#fileInputB")?.removeAttribute("hidden");
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
        this.gridApiA?.redrawRows();
        this.gridApiB?.redrawRows();
    }

    parseApiResponse(apiResponse: CompareApiResponse, diffs: CompareResultCoords) {
        this.parseResults(apiResponse.result.cellsOnlyInFileA, diffs.cellsOnlyInFileA);
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

