import _ from 'lodash'
import { Mutators } from '../lib/data/tools'
import Purify from 'dompurify'
export const NULL = '(NULL)'
import { yesNoFormatter } from '@shared/lib/tabulator/formatters'


function sanitizeHtml(value) {
  if (!value) return null
  return Purify.sanitize(value)
}


export default {

  methods: {
    cellFormatter(cell) {
      if (_.isNil(cell.getValue())) {
        return '<span class="null-value">(NULL)</span>'
      }

      let cellValue = cell.getValue().toString();
      cellValue = cellValue.replace(/\n/g, ' ↩ ');
      cellValue = sanitizeHtml(cellValue);
      // removing the <pre> will break selection / copy paste, see ResultTable
      const result = `<pre>${cellValue}</pre>`
      return result;
    },
    yesNoFormatter,
    ...Mutators
  }
}
