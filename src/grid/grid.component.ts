import { Component, ViewChildren, QueryList, OnInit, HostListener } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { GridFileReader } from './grid.fileReader';
import { environment } from '../environment/environment';
import { CompareResultCoords, Coords, FileInputs } from './entities/entities';
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
export class GridComponent{
    constructor(private httpClient: HttpClient){}
    @ViewChildren(GridItemComponent) GridItems: QueryList<GridItemComponent>;

    //TODO: api class
    SERVER_URL = environment.api + environment.compareBaseUrl;
    CompareApi = "";

    fileInputs = new FileInputs();
    diffs = new CompareResultCoords();

    public compare() {
        if (!this.fileInputs.fileA.readFinish || !this.fileInputs.fileB.readFinish) {
            alert('files are not fully loaded yet');
            return;
        }

        this.uploadFile(this.fileInputs.fileA.content, this.fileInputs.fileB.content);
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

    public clearFile(fileName: string){
        console.log("clear grid " + fileName);
        this.diffs = new CompareResultCoords();
        this.highlightDiffs(this.diffs);
        let gridFile = document.querySelector<HTMLElement>("#myGridFile" + fileName)!;
        gridFile.setAttribute("hidden", "true");
        document.querySelector<HTMLElement>("#fileInput" + fileName)?.removeAttribute("hidden");
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

