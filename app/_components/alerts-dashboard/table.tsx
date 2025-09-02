import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// * this is a custom table component for dtc not to be used anywhere else
export default function TableN({ tableHead, tableData, isStripped }: { tableHead: string[]; tableData: Record<string, any>[]; isStripped: boolean }) {
	return (
		<div>
			<div className='bg-background overflow-hidden rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							{tableHead.map((head) => (
								<TableHead key={head} className='text-nowrap'>
									{head}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{tableData.map((row, rowIndex) => (
							<TableRow key={rowIndex} className={`${rowIndex % 2 === 0 && isStripped ? 'bg-neutral-100' : ''}`}>
								{Object.values(row).map((cell, cellIndex) =>
									cellIndex !== Object.values(row).length - 1 ? (
										<TableCell key={cellIndex} className='py-2'>
											{cell}
										</TableCell>
									) : null
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
