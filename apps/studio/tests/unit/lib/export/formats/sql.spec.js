import { SqlExporter } from '@/lib/export/formats/sql'


describe('sql exporter', () => {

  let exporter = new SqlExporter("./tmp/sql.export", {connectionType: 'postgresql'}, { name: 'table'}, '', '', [], {}, {})

  it("Should generate a basic insert", () => {
    const input = ['a', 'b']
    const result = exporter.formatRow(input)
    expect(result).toBe(`insert into "table" ("col_1", "col_2") values ('a', 'b')`)
  });

  it("Should generate an insert with json", () => {
    const input = ['a', {x: 'y'}];
    const result = exporter.formatRow(input)
    expect(result).toBe(`insert into "table" ("col_1", "col_2") values ('a', '{"x":"y"}')`)
  });

  it("Should generate an insert with quoted string values", () => {
    const input = ["a'\nb"]
    const result = exporter.formatRow(input)
    expect(result).toBe(`insert into "table" ("col_1") values ('a''\nb')`)
  })

  it("Should set defaultPath correctly after refactor", () => {
    const safeFilename = "exported_data";
    let exporter = new SqlExporter(`${safeFilename}.sql`, {connectionType: 'postgresql'}, { name: 'table'}, '', '', [], {}, {})

    expect(exporter.getFileName()).toBe("exported_data.sql");
  });
});
