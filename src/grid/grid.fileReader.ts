import { Injectable, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { File } from './grid.component';
import { GridApi } from 'ag-grid-community';

@Injectable()
export class GridFileReader implements OnInit {
    ngOnInit(): void {
        console.log('init'); 
    }

    static async readExcelFile(file: any, targetFile: File, targetGridApi: GridApi) {
        targetFile.content = "";
        targetFile.readFinish = false;
        if (file === "") {
            targetFile.readFinish = undefined;
            return;
        }

        let fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = () => {
            let data = fr.result;
            let workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            targetFile.content = XLSX.utils.sheet_to_txt(sheet);
        }
        fr.onloadend = () => {
            targetFile.readFinish = true;
            let fileData = targetFile.content.split('\n').map(function (x) { return x.split('\t') });
            this.createColumns(fileData, targetGridApi, targetFile);
            this.createRowData(fileData, targetGridApi, targetFile);
        }
    }

    static createColumns(fileData: string[][], targetGridApi: GridApi<any>, targetFile: File) {
        targetFile.columns = [];
        let max = this.getMaxNumOfColumns(fileData);
        for (var i = 0; i <= max; i++) {
            targetFile.columns.push({ field: this.colName(i), type:"a" });
        }

        console.log("colDefs" + targetFile.columns);
        targetGridApi.setGridOption("columnDefs", targetFile.columns);
    }

    static createRowData(fileData: string[][], targetGridApi: GridApi<any>, targetFile: File) {
        targetFile.rowData = [];
        for (var i = 0; i < fileData.length; i++) {
            let object = {};
            for (var j = 0; j <= fileData[i].length; j++) {
                let value = fileData[i][j];
                let column = this.colName(j);
                object[column] = value;
            }
            console.log(object);
            targetFile.rowData.push(object);
        }

        console.log(targetFile.rowData);
        targetGridApi.setGridOption("rowData", targetFile.rowData);
    }

    static getMaxNumOfColumns(rowData: any[]) {
        let maxNumberOfColumns = 0;
        for (var i = 0; i < rowData.length; i++) {
            let length = rowData[i].length;
            if (length > maxNumberOfColumns) {
                maxNumberOfColumns = length;
            }
        }

        if (maxNumberOfColumns > 0) {
            return maxNumberOfColumns - 1; //showing 1 more column for formatting reasons
        } else {
            return maxNumberOfColumns;
        }
    }

    static colName(n): string {
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;

        var s = "";
        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s.toUpperCase();
    }

    static colNameToNumber(val): number {
        var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

        for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
            result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
        }

        return result;
    }
}