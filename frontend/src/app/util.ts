
export function SimilarText(first: string, second: string, percent = false) {
  // discuss at: http://locutus.io/php/similar_text/
  // original by: Rafał Kukawski (http://blog.kukawski.pl)
  // bugfixed by: Chris McMacken
  // bugfixed by: Jarkko Rantavuori (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
  // improved by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)

  if (first === null ||
    second === null ||
    typeof first === 'undefined' ||
    typeof second === 'undefined') {
    return 0
  }

  first += ''
  second += ''
  let pos1 = 0
  let pos2 = 0
  let max = 0
  let p, q, l, sum

  const firstLength = first.length
  const secondLength = second.length

  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0; (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++) { }
      if (l > max) {
        max = l
        pos1 = p
        pos2 = q
      }
    }
  }

  sum = max
  if (sum) {
    if (pos1 && pos2) {
      sum += SimilarText(first.substr(0, pos1), second.substr(0, pos2))
    }
    if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
      sum += SimilarText(
        first.substr(pos1 + max, firstLength - pos1 - max),
        second.substr(pos2 + max,
          secondLength - pos2 - max))
    }
  }
  if (!percent) {
    return sum
  }
  return (sum * 200) / (firstLength + secondLength)
}
