import { SearchService } from './search/search.service';
import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'app';
  isDev = true;

  @ViewChild('searchBar') searchBar;
  // lastDialogResult: string;

  // private _dialog: MatDialog,
  // private snackbar: MatSnackBar
  constructor() {
  }

  public ngOnInit(): void {

  }

  openDialog() {
    /*let dialogRef = this._dialog.open(DialogContent);

    dialogRef.afterClosed().subscribe(result => {
      this.lastDialogResult = result;
    })*/
  }

  showSnackbar() {
    const config = new MatSnackBarConfig();
    config.duration = 1000;
    config.extraClasses = undefined;
    // this.snackbar.open('YUM SNACKS', 'UNDO', config);
    // this.snackbar.open('YUM SNACKS', 'CHEW');
  }

}

