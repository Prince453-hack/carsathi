import { operatorFilterFn } from '@/app/helpers/customTableFilterFns';
import { Cell, ColumnDef, HeaderContext, Row } from '@tanstack/react-table';
import { DownloadReportTs } from '../../common/CustomTableN';

interface TableRow {
	[key: string]: any;
}

export const getTripsColumns = ({ data }: { data: getTripVehiclesResponse | undefined }) => {
	let additionalColKeys: string[] = [];
	if (data && data.list && data.list[0].extraInfo !== null) {
		const additionalColKeysInJSON = JSON.parse(localStorage.getItem('auth-session') || '').extraInfo;
		additionalColKeys = JSON.parse(additionalColKeysInJSON || '[]');
	}

	const cols: ColumnDef<TableRow>[] = [
		{
			accessorKey: 'lorry_no',
			header: 'Vehicle Number',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'departure_date',
			header: 'Departure Date',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'party_name',
			header: 'Party Name',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'station_from_location',
			header: 'Start Location',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'station_to_location',
			header: 'End Location',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		...(additionalColKeys.length > 0
			? additionalColKeys.map((key) => {
					return {
						header: key,
						cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
							row.original.extraInfo ? JSON.parse(row.original.extraInfo)[key] : '',
						footer: (props: HeaderContext<TableRow, unknown>) => props.column.id,
					};
			  })
			: []),
		{
			accessorKey: 'vaiOne',
			header: 'Vai 1',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiOneInTime',
			header: 'Vai 1 in-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiOneInTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiOneInTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiOneOutTime',
			header: 'Vai 1 out-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiOneOutTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiOneOutTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiTwo',
			header: 'Vai 2',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiTwoInTime',
			header: 'Vai 2 in-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiTwoInTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiTwoInTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiTwoOutTime',
			header: 'Vai 2 out-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiTwoOutTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiTwoOutTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiThree',
			header: 'Vai 3',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},

		{
			accessorKey: 'vaiThreeInTime',
			header: 'Vai 3 in-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiThreeInTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiThreeInTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiThreeOutTime',
			header: 'Vai 3 out-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiThreeOutTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiThreeOutTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiFour',
			header: 'Vai 4',
			footer: (props) => props.column.id,

			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiFourInTime',
			header: 'Vai 4 in-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiFourInTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiFourInTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'vaiFourOutTime',
			header: 'Vai 4 out-time',
			footer: (props) => props.column.id,
			cell: ({ cell, row }: { cell: Cell<TableRow, unknown>; row: Row<TableRow> }) =>
				row.original.vaiFourOutTime !== '01 Jan 1970 05:30:00' ? `${row.original.vaiFourOutTime}` : '',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
	];

	return cols;
};

export const downloadTripReport = ({
	data,
	setDownloadReport,
}: {
	data: getTripVehiclesResponse | undefined;
	setDownloadReport: React.Dispatch<React.SetStateAction<DownloadReportTs | undefined>>;
}) => {
	if (!data) return;

	let additionalColKeys: string[] = [];
	if (data && data.list && data.list[0].extraInfo !== null) {
		// todo make the keys dependent on a field in auth
		const additionalColKeysInJSON = JSON.parse(localStorage.getItem('auth-session') || '').extraInfo;
		additionalColKeys = JSON.parse(additionalColKeysInJSON || '[]');
	}

	let rows: any[] = data.list.map((item, index) => ({
		['Vehicle Number']: item.lorry_no,
		['Departure Date']: item.departure_date,
		['Party Name']: item.party_name,
		['Start Location']: item.station_from_location,
		['End Location']: item.station_to_location,
		...(additionalColKeys.length > 0
			? additionalColKeys.map((key) => {
					return {
						[key]: item.extraInfo ? JSON.parse(item.extraInfo)[key] : '',
					};
			  })
			: null),

		['Vai 1']: item.vaiOne,
		['Vai 1 In Time']: item.vaiOneInTime,
		['Vai 1 Out Time']: item.vaiOneOutTime,
		['Vai 2']: item.vaiTwo,
		['Vai 2 In Time']: item.vaiTwoInTime,
		['Vai 2 Out Time']: item.vaiTwoOutTime,
		['Vai 3']: item.vaiThree,
		['Vai 3 In Time']: item.vaiThreeInTime,
		['Vai 3 Out Time']: item.vaiThreeOutTime,
		['Vai 4']: item.vaiFour,
		['Vai 4 In Time']: item.vaiFourInTime,
		['Vai 4 Out Time']: item.vaiFourOutTime,
	}));

	const head = Object.keys(rows[0]);

	const body = rows.map((row) => Object.values(row));

	let columnsStyles: any = {};

	body[0].map((value: any, index) => {
		columnsStyles[index] = { cellWidth: value.toString().length > 10 ? 50 : 20 };
	});

	setDownloadReport({
		title: 'Trip Report',
		excel: { title: 'Trip Report', rows, footer: [] },
		pdf: {
			head: [head],
			body: body,
			title: 'Trip Report',
			pageSize: 'a3',
			userOptions: {
				columnStyles: columnsStyles,
			},
		},
	});
};
