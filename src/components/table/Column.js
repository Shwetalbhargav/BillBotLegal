// Optional JSDoc for editor hints. No runtime types needed.
/**
 * @typedef {Object} Column
 * @property {string} id
 * @property {import('react').ReactNode} header
 * @property {(row:any)=>import('react').ReactNode} [accessor]
 * @property {number|string} [width]
 * @property {boolean} [sortable]
 * @property {"left"|"center"|"right"} [align]
 * @property {import('react').ReactNode} [filter]
 * @property {(row:any)=>import('react').ReactNode} [cell]
 * @property {boolean} [selection]
 */

export default class Column {
  constructor(header, accessor, options = {}) {
    this.id = options.id || String(header).toLowerCase().replace(/\s+/g, "_");
    this.header = header;
    this.accessor = accessor;
    this.width = options.width;
    this.sortable = options.sortable;
    this.align = options.align;
    this.filter = options.filter;
    this.cell = options.cell;
    this.selection = options.selection;
  }
}
