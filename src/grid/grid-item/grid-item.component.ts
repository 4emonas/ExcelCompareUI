import { Component, Input } from '@angular/core';
import { GridApi, GridOptions, createGrid, ColDef } from 'ag-grid-community';
import { GridFileReader } from '../grid.fileReader';
import { File, CompareResultCoords, Coords, FileInputs, colourDifferenceDictionary } from '../entities/entities'


@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.css'
})
export class GridItemComponent {

  ngOnInit() {
    this.gridFileSelector = "#myGridFile" + this.fileName;
    this.fileInputSelector = "#fileInput" + this.fileName;
    this.file = this.fileInputs['file' + this.fileName];
  }

  @Input() fileName: string = "";
  @Input() fileInputs: FileInputs;
  @Input() diffs: CompareResultCoords;

  gridApi: GridApi<any>;
  file: File = { content: '', readFinish: undefined, rowData: [], columns: [] };

  gridFileSelector: string = "";
  fileInputSelector: string = "";

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
          const arrayName = 'cellsOnlyInFile' + this.fileName;
          if ((this.diffs[arrayName] as Coords[]).some(t => t.x === coords.x && t.y === coords.y)) {
            return { backgroundColor: colourDifferenceDictionary[this.fileName] };
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
    console.log("malakas")
    console.log(this.gridFileSelector + " read file");
    let gridFile = document.querySelector<HTMLElement>(this.gridFileSelector)!; //TODO: take the element name as input
    document.querySelector<HTMLElement>(this.fileInputSelector)?.setAttribute("hidden", "true");
    gridFile.removeAttribute("hidden");
    this.gridApi = this.gridApi == undefined ? createGrid(gridFile, this.gridOptionsFile) : this.gridApi;
    if (e.type == "change") {
      GridFileReader.readExcelFile(e.target.files[0], this.file, this.gridApi);
    } else {
      GridFileReader.readExcelFile(e[0], this.file, this.gridApi);
    }
  }

  public clearFile() {
    console.log("clear grid");
    this.diffs = new CompareResultCoords();
    //this.highlightDiffs(this.diffs); //TODO: bring this back when done as last step
    this.gridApi?.redrawRows();
    let gridFile = document.querySelector<HTMLElement>(this.gridFileSelector)!;
    gridFile.setAttribute("hidden", "true");
    document.querySelector<HTMLElement>(this.fileInputSelector)?.removeAttribute("hidden");
  }

  public highlightDiffs() {
    this.gridApi?.redrawRows();
  }
}
