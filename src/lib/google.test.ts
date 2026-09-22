/** @jest-environment node */
import { ensureSheetColumnCapacity, type SheetsClient } from "./google";
it.each([26,30,31,40])("only extends a sheet with %i columns when needed", async columns => {
  const batchUpdate = jest.fn().mockResolvedValue({});
  const sheets = {spreadsheets:{get:jest.fn().mockResolvedValue({data:{sheets:[{properties:{sheetId:7,title:"pre",gridProperties:{columnCount:columns}}}]}}),batchUpdate}} as unknown as SheetsClient;
  await ensureSheetColumnCapacity(sheets,"test","pre",31);
  if(columns < 31) expect(batchUpdate).toHaveBeenCalledWith({spreadsheetId:"test",requestBody:{requests:[{appendDimension:{sheetId:7,dimension:"COLUMNS",length:31-columns}}]}});
  else expect(batchUpdate).not.toHaveBeenCalled();
});
