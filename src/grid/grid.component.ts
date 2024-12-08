import { Component, ViewChildren, QueryList, OnInit, HostListener } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';
import { GridFileReader } from './grid.fileReader';
import { environment } from '../environment/environment';
import { File, CompareResultCoords, Coords, FileInputs } from './entities/entities';
import { GridItemComponent } from './grid-item/grid-item.component';

interface CompareApiResponse {
    result: {
        cellsOnlyInFileA: string[],
        cellsOnlyInFileB: string[],
        cellsWithDifferentValues: string[]
    }
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
        // if (identifier.indexOf("first")>=0){
        //     this.readExcelFileA(event.dataTransfer.files);
        //     return;
        // }

        // if (identifier.indexOf("second")>=0){
        //     this.readExcelFileB(event.dataTransfer.files);
        //     return;
        // }
    }

    @ViewChildren(GridItemComponent) GridItems: QueryList<GridItemComponent>;

    SERVER_URL = environment.api + environment.compareBaseUrl;
    CompareApi = "";
    fileInputs = new FileInputs();
    diffs = new CompareResultCoords();


    public compare() {
        console.log(this.fileInputs);
        if (!this.fileInputs.fileA.readFinish || !this.fileInputs.fileB.readFinish) {
            alert('files are not fully loaded yet');
            return;
        }

        this.uploadFile(this.fileInputs.fileA.content, this.fileInputs.fileB.content);
    }

    //TODO: move to ClearFile(string fileName)
    public clearFileA(){
        console.log("clear grid");
        this.diffs = new CompareResultCoords();
        this.highlightDiffs(this.diffs);
        let gridFileA = document.querySelector<HTMLElement>("#myGridFileA")!;
        gridFileA.setAttribute("hidden", "true");
        document.querySelector<HTMLElement>("#fileInputA")?.removeAttribute("hidden");
    }

    //TODO: move to ClearFile(string fileName)
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
        this.GridItems.forEach(item => {
            item.highlightDiffs();
        })
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

