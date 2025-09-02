'use client';

import { CloudUploadOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';

export const CsvUploader = ({ setCsvData }: { setCsvData: React.Dispatch<React.SetStateAction<Record<string, string>[]>> }) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const file = files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const text = e.target?.result;

				if (typeof text !== 'string') return;
				setCsvData(csvToJson(text));
			};
			reader.readAsText(file);

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	// Helper function to handle quoted commas in CSV
	function parseCsvLine(line: string): string[] {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if (char === '"') {
				inQuotes = !inQuotes; // Toggle in/out of quotes
			} else if (char === ',' && !inQuotes) {
				// Only split if not within quotes
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}

		// Push the last value
		result.push(current.trim());
		return result;
	}

	function csvToJson(csv: string): Record<string, string>[] {
		const lines: string[] = csv.split('\n');
		const headers: string[] = parseCsvLine(lines[0]);

		return lines.slice(1, lines.length - 1).map((line) => {
			const values: string[] = parseCsvLine(line);
			return headers.reduce(
				(obj, header, index) => {
					obj[header.trim()] = values[index]?.trim() || '';
					return obj;
				},
				{} as Record<string, string>
			);
		});
	}

	return (
		<div>
			<input type='file' accept='.csv' id='csvInput' className='hidden' onChange={handleFileUpload} ref={fileInputRef} />
			<label
				htmlFor='csvInput'
				className='text-xl text-primary-green cursor-pointer hover:bg-neutral-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-300'
			>
				<CloudUploadOutlined />
			</label>
		</div>
	);
};
