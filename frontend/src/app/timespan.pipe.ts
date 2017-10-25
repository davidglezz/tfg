import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timespan'
})
export class TimespanPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    function numberEnding(number) {
      return number > 1 ? 's' : '';
    }

    let temp = Math.floor(value / 1000);

    const years = Math.floor(temp / 31536000);
    if (years) {
      return years + ' año' + numberEnding(years);
    }

    /*var month = Math.floor((temp %= 31536000) / 86400);
    if (month) {
      return month + ' month' + numberEnding(month);
    }*/

    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      return days + ' dia' + numberEnding(days);
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return hours + ' hora' + numberEnding(hours);
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return minutes + ' minuto' + numberEnding(minutes);
    }
    const seconds = temp % 60;
    if (seconds) {
      return seconds + ' segundo' + numberEnding(seconds);
    }
    return 'menos de un segundo';
  }

}
