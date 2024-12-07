import { Component, Input } from '@angular/core';
import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';
import { GridFileReader } from '../grid.fileReader';
import { File, CompareResultCoords, Coords } from '../entities/entities'


@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.css'
})
export class GridItemComponent {

  ngOnInit() {
    console.log('GridItemComponent initialized');
  }
  
  @Input() diffs: CompareResultCoords;

  gridApi: GridApi<any>;
  file: File = { content: '', readFinish: undefined, rowData: [], columns: [] };

  gridOptionsFile: GridOptions<any> = {
    columnDefs: this.file.columns,
    rowData: this.file.rowData,
    defaultColDef: {
        initialWidth: 100,
    },
    columnTypes: {
        a: {
            cellStyle: (params) => {
                let i = params.rowIndex;
                let j = this.gridApi.getAllDisplayedColumns().indexOf(params.column);
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

  async readExcelFile(e: any) {
    console.log("gridFileA");
    let gridFile = document.querySelector<HTMLElement>("#myGridFileA")!; //TODO: take the element name as input
    document.querySelector<HTMLElement>("#fileInputA")?.setAttribute("hidden", "true");
    gridFile.removeAttribute("hidden");
    this.gridApi = this.gridApi == undefined ? createGrid(gridFile, this.gridOptionsFile) : this.gridApi;
    if (e.type=="change"){
        GridFileReader.readExcelFile(e.target.files[0], this.file, this.gridApi);
    }else{
        GridFileReader.readExcelFile(e[0], this.file, this.gridApi);
    }
  }

  public clearFile(){
    console.log("clear grid");
    this.diffs = new CompareResultCoords();
    //this.highlightDiffs(this.diffs);
    this.gridApi?.redrawRows();
    let gridFileA = document.querySelector<HTMLElement>("#myGridFileA")!;
    gridFileA.setAttribute("hidden", "true");
    document.querySelector<HTMLElement>("#fileInputA")?.removeAttribute("hidden");
  }
}
