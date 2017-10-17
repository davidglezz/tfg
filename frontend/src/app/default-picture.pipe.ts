import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'defaultPicture'
})
export class DefaultPicturePipe implements PipeTransform {
    transform(value: any): any {
        return !value ? 'assets/img/no-image.svg' : value
    }
}
