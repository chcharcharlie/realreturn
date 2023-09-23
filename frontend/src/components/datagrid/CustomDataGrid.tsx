import { useState } from 'react';
// @mui
import { Box, Rating } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridRowSelectionModel,
  getGridNumericOperators,
  GridFilterInputValueProps,
} from '@mui/x-data-grid';

export default function CustomDataGrid({ data, columns, columnGrouping, processRowUpdate, onProcessRowUpdateError, apiRef }) {
  const [, setSelectionModel] = useState<GridRowSelectionModel>([]);

  if (columns.length > 0) {
    const ratingColumn = columns.find((column) => column.field === 'rating')!;
    const ratingColIndex = columns.findIndex((col) => col.field === 'rating');

    const ratingFilterOperators = getGridNumericOperators().map((operator) => ({
      ...operator,
      InputComponent: RatingInputValue,
    }));
    columns[ratingColIndex] = {
      ...ratingColumn,
      filterOperators: ratingFilterOperators,
    };
  }


  return (
    <DataGrid
      autoHeight
      disableRowSelectionOnClick
      rows={data}
      columns={columns}
      // columnGroupingModel={columnGrouping}
      // experimentalFeatures={{ columnGrouping: true }}
      pagination
      onRowSelectionModelChange={(newSelectionModel) => {
        setSelectionModel(newSelectionModel);
      }}
      components={{
        Toolbar: GridToolbar,
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            id: false,
          },
        },
      }}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={onProcessRowUpdateError}
      apiRef={apiRef}
      disableColumnMenu
      sx={{
        borderRadius: 0,
        '.MuiDataGrid-columnSeparator': {
          display: 'none',
        },
        '&.MuiDataGrid-root': {
          border: 'none',
        },
        '.MuiDataGrid-columnHeaders': {
          backgroundColor: '#F4F6F8',
          "--unstable_DataGrid-radius": 0,
        }
      }}
    />
  );
}

function RatingInputValue({ item, applyValue }: GridFilterInputValueProps) {
  return (
    <Box sx={{ p: 1, height: 1, alignItems: 'flex-end', display: 'flex' }}>
      <Rating
        size="small"
        precision={0.5}
        placeholder="Filter value"
        value={Number(item.value)}
        onChange={(event, newValue) => {
          applyValue({ ...item, value: newValue });
        }}
      />
    </Box>
  );
}
