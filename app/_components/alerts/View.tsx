'use client';

import { PlusCircleFilled, SettingFilled } from '@ant-design/icons';
import { Button, Card, notification, Select, Tag, Tooltip } from 'antd';
import { AlertsReportTable, AlertsManagement } from './index';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RootState } from '@/app/_globalRedux/store';
import { useSelector } from 'react-redux';
import { useLazyGetAlertsByDateQuery, useLazyGetDTCResultQuery } from '@/app/_globalRedux/services/trackingDashboard';
import moment from 'moment';
import { AlertByDateLorryData, AlertByDayEvents } from '@/app/_globalRedux/services/types/alerts';
import { ColumnDef } from '@tanstack/react-table';
import { operatorFilterFn } from '@/app/helpers/customTableFilterFns';
import { useGetUserAlertsQuery } from '@/app/_globalRedux/services/yatayaat';
import CustomDatePicker from '../common/datePicker';
import { setHours, setMinutes } from 'date-fns';
import React from 'react';
import { openNotification } from '../dashboard/alertsNotification/AlertNotifications';
import { AllVehiclesSelect } from '../dashboard';
import { isKmtAccount } from '@/app/helpers/isKmtAccount';
import { covertDtcToAlerts } from './covertDtctoAlerts';

type DTCAlerts = 'Acceleration' | 'Battery' | 'Brake' | 'Engine' | 'SafetySystems' | 'Tire' | 'Transmission' | 'Other';

// An array containing all valid DTCAlerts values.
const validDTCAlerts: DTCAlerts[] = ['Acceleration', 'Battery', 'Brake', 'Engine', 'SafetySystems', 'Tire', 'Transmission', 'Other'];

// Type guard function that checks if a given value is a valid DTCAlerts.
export function isValidDTCAlert(value: any): value is DTCAlerts {
	return validDTCAlerts.includes(value);
}

const getAdjustedAlerts = ({
	data,
	setAdjustAlertsAsList,
	setAlertCount,
	isPolling,
	dtcAlerts,
	selectedAlertOption,
	isDTC,
}: {
	data: AlertByDateLorryData[];
	setAdjustAlertsAsList: Dispatch<SetStateAction<AlertByDayEvents[]>>;
	setAlertCount: Dispatch<
		SetStateAction<
			{
				value:
					| 'acceleration'
					| 'battery'
					| 'brake'
					| 'engine'
					| 'safetySystems'
					| 'tire'
					| 'transmission'
					| 'other'
					| 'contineousDrive'
					| 'freewheeling'
					| 'freewheelingWrong'
					| 'harshacc'
					| 'harshBreak'
					| 'internalPower'
					| 'overspeedKMT'
					| 'MainpowerConnected'
					| 'mainpower'
					| 'nightdrive'
					| 'PoscoOverspeed';
				title: string;
				count: number;
				type: 'DRIVER_BEHAVIOUR' | 'OTHERS' | 'DTC';
				label: string;
				isNewData: boolean;
			}[]
		>
	>;
	isPolling?: boolean;
	dtcAlerts?: AlertByDayEvents[] | null;
	selectedAlertOption: string | undefined;
	isDTC: boolean;
}) => {
	if (data && data.length) {
		const alert = data[0];
		const tempAlerts: AlertByDayEvents[] = [
			...(alert.contineousDrive ? alert.contineousDrive : []),
			...(alert.freewheeling ? alert.freewheeling : []),
			...(alert.freewheelingWrong ? alert.freewheelingWrong : []),
			...(alert.harshBreak ? alert.harshBreak : []),
			...(alert.harshacc ? alert.harshacc : []),
			...(alert.highenginetemperature ? alert.highenginetemperature : []),
			...(alert.idle
				? alert.idle.map((idleAlert) => ({
						...idleAlert,
						AlertStatus: idleAlert.remark ? 'Closed' : 'Open',
				  }))
				: []),
			...(alert.internalPower ? alert.internalPower : []),
			...(alert.lowengineoilpressure ? alert.lowengineoilpressure : []),
			...(alert.mainpower ? alert.mainpower : []),
			...(alert.MainpowerConnected ? alert.MainpowerConnected : []),
			...(alert.nightdrive ? alert.nightdrive : []),
			...(alert.overspeed ? alert.overspeed : []),
			...(alert.overspeedKMT ? alert.overspeedKMT : []),
			...(alert.panic ? alert.panic : []),
			...(alert.services ? alert.services : []),
			...(alert.document ? alert.document : []),
			...(alert.transitdelay ? alert.transitdelay : []),
			...(alert.unlockonmove ? alert.unlockonmove : []),
			...(alert.PoscoOverspeed ? alert.PoscoOverspeed : []),
			...(alert.geofence ? alert.geofence : []),
		];

		tempAlerts.sort((a, b) => {
			if (a.endtime && b.endtime) moment(b.endtime).unix() - moment(a.endtime).unix();
			return moment(b.starttime).unix() - moment(a.starttime).unix();
		});

		if (isDTC) {
			if (dtcAlerts && (selectedAlertOption === 'All' || selectedAlertOption === undefined || selectedAlertOption === '')) {
				tempAlerts.push(...dtcAlerts);
			} else if (isValidDTCAlert(selectedAlertOption) && dtcAlerts) {
				const filteredAlerts = dtcAlerts.filter((alert) => alert.exception_type === selectedAlertOption);

				tempAlerts.push(...filteredAlerts);
			}
		}

		setAdjustAlertsAsList(tempAlerts);

		setAlertCount((prev) =>
			prev.map((alertType) => {
				const oldCount = alertType.count;

				if (alertType.type === 'DTC') {
					return {
						...alertType,
						count: dtcAlerts?.filter((item) => item.exception_type === alertType.label).length || 0,
						isNewData: isPolling ? oldCount !== dtcAlerts?.filter((item) => item.exception_type === alertType.label).length : alertType?.isNewData,
					};
				} else {
					return {
						...alertType,
						count:
							(alert[alertType.value as keyof typeof alert] as [])?.length > 0
								? (alert[alertType.value as keyof typeof alert] as [])?.length
								: oldCount,
						isNewData: isPolling ? oldCount !== (alert[alertType.value as keyof typeof alert] as [])?.length : alertType?.isNewData,
					};
				}
			})
		);
	}
};

type AllColumnTypes = {
	['Alert Type']: boolean;
	['Vehicle No']: boolean;
	['Start Time']: boolean;
	['End Time']: boolean;
	['Start Location']: boolean;
	['End Location']: boolean;
	Distance: boolean;
	['End Location']: boolean;
	['End Time']: boolean;
	Duration: boolean;
	Speed: boolean;
	['Running Hrs']: boolean;
	['Total Stoppages']: boolean;
	['Alert Receiving Time']: boolean;
	['Halting Hour']: boolean;
	['Invoice No']: boolean;
	['Invoice Date']: boolean;
	['Remarks']: boolean;
	['Alert Status']: boolean;
	['Deviate Route']: boolean;
	Description: boolean;
	Alert: boolean;
	SetAt: boolean;
	Severity: boolean;
	Code: boolean;
};

const allColumnTypes: AllColumnTypes = {
	['Alert Type']: true,
	['Vehicle No']: true,
	['Start Time']: true,
	['End Time']: true,
	['Start Location']: true,
	['End Location']: true,
	['Halting Hour']: true,
	Distance: true,
	Duration: true,
	Speed: true,
	['Running Hrs']: true,
	['Total Stoppages']: true,
	['Alert Receiving Time']: true,
	['Invoice No']: true,
	['Invoice Date']: true,
	['Remarks']: true,
	['Alert Status']: true,
	['Deviate Route']: true,
	Description: true,
	Alert: true,
	SetAt: true,
	Severity: true,
	Code: true,
};

const allAlertOptions = [
	{
		label: 'All',
		value: 'All',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Speed: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},

	{
		label: 'Harsh Acceleration',
		value: 'Harsh Acceleration',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['Start Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Harsh Break',
		value: 'harshBreaking',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['End Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Main Power Disconnect',
		value: 'Mainpower',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['End Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Main power disconnected',
		value: 'Mainpower',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['End Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Main Power Connected',
		value: 'MainpowerConnected',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['End Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Internal Battery Disconnected',
		value: 'Internalpower',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Speed: false,
			Distance: false,
			Duration: false,
			['End Location']: false,
			['End Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Overspeed',
		value: 'Overspeeding',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'OverSpeed',
		value: 'OverSpeed',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Free Wheeling',
		value: 'Freewheeling',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Diagnosed RPM',
		value: 'freewheelingWrong',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Continuous Drive',
		value: 'ContinousDrive',
		columns: {
			...allColumnTypes,
			Distance: false,
			Speed: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},

	{
		label: 'Posco Overspeed',
		value: 'PoscoOverspeed',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'idle',
		value: 'Idle',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['End Location']: false,
			['End Time']: false,
			['Speed']: false,
			Distance: false,
			Duration: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},

	{
		label: 'Posco Overspeed',
		value: 'PoscoOverspeed',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},

	{
		label: 'Idle',
		value: 'Idle',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['End Location']: false,
			['End Time']: false,
			['Speed']: false,
			Distance: false,
			Duration: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'GeoFence',
		value: 'GeoFence',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['End Location']: false,
			['End Time']: false,
			['Speed']: false,
			Distance: false,
			Duration: false,
			['Halting Hour']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Panic',
		value: 'Panic',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'AC',
		value: 'AC',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},

	{
		label: 'GPS Disconnect',
		value: 'GPS Disconnect',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'High Engine Temperature',
		value: 'High Engine Temperature',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Idling',
		value: 'Idling',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['End Location']: false,
			['End Time']: false,
			['Speed']: false,
			Distance: false,
			Duration: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Ignition',
		value: 'Ignition',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Ignition Night',
		value: 'Ignition Night',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Low Engine Oil Pressure',
		value: 'Low Engine Oil Pressure',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Service',
		value: 'Service',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Document',
		value: 'Document',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Temperature',
		value: 'Temperature',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Unlock on move',
		value: 'UnlockOnMove',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Unlock On Move',
		value: 'unlockonmove',
		columns: {
			...allColumnTypes,
			['End Location']: false,
			Distance: false,
			Duration: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			['Deviate Route']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	},
	{
		label: 'Acceleration',
		value: 'Acceleration',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Battery',
		value: 'Battery',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Brake',
		value: 'Brake',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Engine',
		value: 'engine',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Safety Systems',
		value: 'safetySystems',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Tire',
		value: 'tire',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Transmission',
		value: 'transmission',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
	{
		label: 'Other',
		value: 'other',
		columns: {
			...allColumnTypes,
			['Start Time']: false,
			['End Time']: false,
			['End Location']: false,
			['Halting Hour']: false,
			Duration: false,
			Remarks: false,
			Speed: false,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			['Invoice No']: false,
			['Alert Status']: false,
		},
	},
];

export const View = () => {
	const [isAlertManagement, setIsAlertManagement] = useState(false);
	const [modalViewToggle, setModalViewToggle] = useState<'DETAILS' | 'EDIT' | 'CREATE'>('DETAILS');
	const [isModalActive, setIsModalActive] = useState(false);
	const [isDrawerActive, setIsDrawerActive] = useState(false);
	const [isServicesAndDocumentsDrawerActive, setIsServicesAndDocumentsDrawerActive] = useState(false);
	const [alertOptions, setAlertOptions] = useState<{ label: string; value: string; columns: AllColumnTypes }[]>();
	const allVehicles = useSelector((state: RootState) => state.allVehicles);

	const [selectedAlertOption, setSelectedAlertOption] = useState<{ label: string; value: string; columns: AllColumnTypes }>({
		label: 'All',
		value: 'All',
		columns: {
			...allColumnTypes,
			['Running Hrs']: false,
			['Total Stoppages']: false,
			['Alert Receiving Time']: false,
			Speed: false,
			['Halting Hour']: false,
			['Invoice No']: false,
			['Invoice Date']: false,
			['Remarks']: false,
			['Alert Status']: false,
			Description: false,
			Alert: false,
			SetAt: false,
			Severity: false,
			Code: false,
		},
	});
	const selectedStyles = {
		selectorBg: '#fff',
		colorBorder: '#eee',
		fontSize: 14,
		fontWeight: 600,
		optionFontSize: 14,
		optionPadding: '5px',
		optionSelectedColor: '#000',
		width: 'w-[200px]',
	};
	const [adjustedAlertsAsList, setAdjustedAlertsAsList] = useState<AlertByDayEvents[]>([]);

	const { userId, groupId, parentUser } = useSelector((state: RootState) => state.auth);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);

	const [loading, setLoading] = useState(true);
	const [alertCount, setAlertCount] = useState<
		{
			value:
				| 'acceleration'
				| 'battery'
				| 'brake'
				| 'engine'
				| 'safetySystems'
				| 'tire'
				| 'transmission'
				| 'other'
				| 'contineousDrive'
				| 'freewheeling'
				| 'freewheelingWrong'
				| 'harshacc'
				| 'harshBreak'
				| 'internalPower'
				| 'overspeedKMT'
				| 'MainpowerConnected'
				| 'mainpower'
				| 'nightdrive'
				| 'PoscoOverspeed';
			title: string;
			count: number;
			type: 'DRIVER_BEHAVIOUR' | 'OTHERS' | 'DTC';
			label: string;
			isNewData: boolean;
		}[]
	>([
		{
			label: 'Accelleration',
			title: 'AC',
			value: 'acceleration',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Battery',
			title: 'BT',
			value: 'battery',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},

		{
			label: 'Brake',
			title: 'BR',
			value: 'brake',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Engine',
			title: 'ENG',
			value: 'engine',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Safety Systems',
			title: 'SS',
			value: 'safetySystems',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Tire',
			title: 'TR',
			value: 'tire',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Transmission',
			title: 'TR',
			value: 'transmission',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Other',
			title: 'OTH',
			value: 'other',
			type: 'DTC',
			count: 0,
			isNewData: false,
		},

		{
			label: 'Continuous Drive',
			title: 'CD',
			value: 'contineousDrive',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Free Wheeling',
			title: 'FW',
			value: 'freewheeling',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Diagnosed RPM',
			title: 'DRPM',
			value: 'freewheelingWrong',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Harsh Acceleration',
			title: 'HA',
			value: 'harshacc',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Harsh Break',
			title: 'HB',
			value: 'harshBreak',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Internal Battery Disconnected',
			title: 'IBD',
			value: 'internalPower',
			type: 'OTHERS',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Overspeed',
			title: 'OS',
			value: 'overspeedKMT',
			type: 'OTHERS',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Main Power Connected',
			title: 'MPC',
			value: 'MainpowerConnected',
			type: 'OTHERS',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Main Power Disconnected',
			title: 'MPD',
			value: 'mainpower',
			type: 'OTHERS',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Night Drive',
			title: 'ND',
			value: 'nightdrive',
			type: 'DRIVER_BEHAVIOUR',
			count: 0,
			isNewData: false,
		},
		{
			label: 'Posco Overspeed',
			title: 'PO',
			value: 'PoscoOverspeed',
			type: 'OTHERS',
			count: 0,
			isNewData: false,
		},
	]);

	const [currentTime, setCurrentTime] = useState(new Date());

	const [pollingInterval, setPollingInterval] = useState(1);

	const [getAlertsByDateTrigger, { isUninitialized }] = useLazyGetAlertsByDateQuery();
	const [getDtcAlertsTrigger] = useLazyGetDTCResultQuery();

	const { data: alertsByUserData, isLoading: isGetAlertByUserDataLoading } = useGetUserAlertsQuery(
		{ token: groupId, userId: userId },
		{ skip: !groupId || !userId }
	);

	const isGetAlertsByDateLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getAlertsByDate' && query.status === 'pending')
	);

	const [api, notificationContextHolder] = notification.useNotification({
		duration: 0,
		placement: 'bottomRight',
		maxCount: 1,
	});

	useEffect(() => {
		if (loading === false) setFilteredColumns(filterColumns(selectedAlertOption.value));
	}, [loading]);

	const columns: ColumnDef<AlertByDayEvents>[] = [
		{
			accessorKey: 'exception_type',
			id: 'exception_type',
			cell: (info: any) => info.getValue(),
			header: 'Alert Type',
			footer: (props: any) => props.column.id,
			filterFn: (row: any, id: any, value: any) => operatorFilterFn(row, id, value),
		},
		{
			accessorFn: (row) => row.vehicle_no,
			id: 'vehicle_no',
			cell: ({ cell }) => cell.row.original.vehicle_no,
			header: 'Vehicle No',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorFn: (row) => row.starttime,
			id: 'start_time',
			cell: (info) => info.getValue(),
			header: 'Start Time',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},

		{
			id: 'startlocation',
			accessorKey: 'startlocation',
			cell: ({ cell, row }) => {
				return (
					<>
						{row.original.startlocation ? (
							<div className='flex items-center justify-between  cursor-pointer'>
								<Tooltip title={row.original.startlocation?.replaceAll('_', ' ')} mouseEnterDelay={1}>
									<div>
										{row.original.startlocation?.replaceAll('_', ' ').slice(0, 60)}
										{row.original.startlocation?.replaceAll('_', ' ').length > 60 ? '...' : ''}
									</div>
								</Tooltip>
							</div>
						) : (
							'NA'
						)}
					</>
				);
			},
			size: isValidDTCAlert(selectedAlertOption.label) ? 400 : undefined,
			header: isValidDTCAlert(selectedAlertOption.label) ? 'Description' : 'Start Location',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorFn: (row) => row.endtime,
			id: 'end_time',
			cell: ({ getValue, row }) => (row.original.journey_statusfinal === 'Ongoing' ? 'Ongoing' : getValue()),
			header: 'End Time',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'endlocation',
			accessorKey: 'endlocation',
			cell: ({ cell, row }) => {
				return (
					<>
						{row.original.endlocation ? (
							<div className='flex items-center justify-between cursor-pointer'>
								<Tooltip title={row.original.endlocation?.replaceAll('_', ' ')} mouseEnterDelay={1}>
									<div>
										{row.original.endlocation?.replaceAll('_', ' ').slice(0, 35)}
										{row.original.endlocation?.replaceAll('_', ' ').length > 35 ? '...' : ''}
									</div>
								</Tooltip>
							</div>
						) : (
							'NA'
						)}
					</>
				);
			},
			header: 'End Location',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'distance',
			accessorKey: 'KM',
			cell: ({ cell, row }) => {
				return (
					<>
						{isValidDTCAlert(selectedAlertOption.label)
							? row.original.KM
							: row.original.KM === 'NA'
							? 'NA'
							: `${Number(row.original.KM)?.toFixed(2)}  KM`}
					</>
				);
			},
			header: isValidDTCAlert(selectedAlertOption.label) ? 'Set At' : 'Distance',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'duration',
			accessorKey: 'duration',
			cell: (info) => (info.getValue() ? info.getValue() : 'NA'),
			header: 'Duration',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},

		{
			id: 'speed',
			accessorKey: 'speed',
			cell: (info) => `${info.getValue()} Km/h`,
			header: 'Speed',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'runninghrs',
			accessorKey: 'runninghrs',
			cell: (info) => info.getValue(),
			header: 'Running hrs',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'totalstoppages',
			accessorKey: 'Halting',
			cell: (info) => info.getValue(),
			header: 'Total Stoppages',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'alert_receiving_number',
			accessorKey: 'speed',
			cell: ({ getValue, row }) => (row.original.journey_statusfinal === 'Ongoing' ? '' : getValue()),
			header: 'Alert Receiving Time',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},

		// * idle alerts specific columns
		{
			id: 'hour',
			accessorKey: 'hour',
			cell: (info) => info.getValue(),
			header: 'Halting Hour',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'deviate_route',
			accessorKey: 'route_name',
			cell: (info) => info.getValue(),
			header: isValidDTCAlert(selectedAlertOption.label) ? 'Code' : 'Deviate Route',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'InvoiceNo',
			accessorKey: 'InvoiceNo',
			cell: (info) => info.getValue(),
			header: 'Invoice No',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'InvoiceDate',
			accessorKey: 'InvoiceDate',
			cell: ({ cell }) =>
				isValidDTCAlert(selectedAlertOption.label) ? (
					<Tag color={cell.row.original.InvoiceDate === 'Minor' ? 'yellow' : cell.row.original.InvoiceDate === 'Moderate' ? 'orange' : 'red'}>
						<p className='text-sm'>{cell.row.original.InvoiceDate}</p>
					</Tag>
				) : (
					cell.row.original.InvoiceDate
				),
			header: isValidDTCAlert(selectedAlertOption.label) ? 'Severity' : 'Invoice Date',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'Remarks',
			accessorKey: 'remark',
			cell: ({ row }) => {
				return (
					<div className='flex items-center justify-between  cursor-pointer relative'>
						<Tooltip title={row.original.remark ? (row.original.remark as string) : 'NA'} mouseEnterDelay={1}>
							<div>
								{selectedAlertOption.value === 'GeoFence' || row.original.remark ? (
									(row.original.remark as string)
								) : (
									<Button
										onClick={() => {
											openNotification({
												description: `Vehicle number ${row.original.vehicle_no} has been idle for ${row.original.hour} hours`,
												vehicleNumber: `${row.original.vehicle_no}`,
												title: 'Idle',
												type: 'Idle',
												alertId: `${row.original.id}`,
												vehicleId: row.original.service_id,
												dateTime: row.original.starttime,
												api: api,
												key: `${row.original.id}` + `${row.original.vehicle_no}`,
												from: 'ALERTS_TABLE',
												fetchUpdatedAlerts: fetchUpdatedAlertsNotificationCard,
											});
										}}
									>
										Add Remark
									</Button>
								)}
							</div>
						</Tooltip>
					</div>
				);
			},
			header: 'Remarks',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			id: 'AlertStatus',
			accessorKey: 'AlertStatus',
			cell: (info) => info.getValue(),
			header: 'Alert Status',
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
	];

	const [customDateRange, setCustomDateRange] = useState([setHours(setMinutes(new Date(), 0), 0), new Date()]);
	const [customDateRangeChanged, setCustomDateRangeChanged] = useState(false);

	const [filteredColumns, setFilteredColumns] = useState<ColumnDef<AlertByDayEvents>[]>();

	const checkIfKmtOrKmtSubUser = () => {
		return (
			Number(userId) === 3356 ||
			Number(parentUser) === 3356 ||
			Number(userId) === 82815 ||
			Number(parentUser) === 82815 ||
			Number(userId) === 84245 ||
			Number(userId) === 83567 ||
			Number(userId) === 84343 ||
			Number(userId) === 78069 ||
			Number(userId) === 81858 ||
			Number(userId) === 81841 ||
			Number(userId) === 5982 ||
			Number(userId) === 79918 ||
			Number(userId) === 81357 ||
			Number(userId) === 81358 ||
			Number(userId) === 85939 ||
			Number(userId) === 82600 ||
			Number(userId) === 84278 ||
			Number(userId) === 85048 ||
			Number(userId) === 87470 ||
			Number(parentUser) === 87470
		);
	};

	useEffect(() => {
		// * if user id is of kmt show the selective values
		if (!isGetAlertByUserDataLoading) {
			if (checkIfKmtOrKmtSubUser()) {
				setAlertOptions([
					{
						label: 'All',
						value: 'All',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Speed: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Harsh Acceleration',
						value: 'harshAcceleration',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							Distance: false,
							Duration: false,
							Speed: false,
							['Start Location']: false,
							['End Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Harsh Break',
						value: 'harshBreaking',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							Distance: false,
							Duration: false,
							Speed: false,
							['End Location']: false,
							['End Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Main Power Disconnected',
						value: 'Mainpower',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							Distance: false,
							Duration: false,
							Speed: false,
							['End Location']: false,
							['End Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Main Power Connected',
						value: 'MainpowerConnected',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							Distance: false,
							Duration: false,
							Speed: false,
							['End Location']: false,
							['End Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Internal Battery Disconnected',
						value: 'Internalpower',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							Speed: false,
							Distance: false,
							Duration: false,
							['End Location']: false,
							['End Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Overspeed',
						value: 'Overspeeding',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Free Wheeling',
						value: 'Freewheeling',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Diagnosed RPM',
						value: 'freewheelingWrong',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Continuous Drive',
						value: 'ContinousDrive',
						columns: {
							...allColumnTypes,
							Distance: false,
							Speed: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Night Drive',
						value: 'NightDrive',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					{
						label: 'Posco Overspeed',
						value: 'PoscoOverspeed',
						columns: {
							...allColumnTypes,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Remarks']: false,
							['Invoice Date']: false,
							['Invoice No']: false,
							['Halting Hour']: false,
							['Alert Status']: false,
							Description: false,
							Alert: false,
							SetAt: false,
							Severity: false,
							Code: false,
						},
					},
					// 'Acceleration' | 'Battery' | 'Brake' | 'Engine' | 'Safety Systems' | 'Tire' | 'Transmission' | 'Other'
					{
						label: 'Acceleration',
						value: 'Acceleration',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Battery',
						value: 'Battery',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Brake',
						value: 'Brake',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Engine',
						value: 'engine',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Safety Systems',
						value: 'safetySystems',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Tire',
						value: 'tire',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Transmission',
						value: 'transmission',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
					{
						label: 'Other',
						value: 'other',
						columns: {
							...allColumnTypes,
							['Start Time']: false,
							['End Time']: false,
							['End Location']: false,
							['Halting Hour']: false,
							Duration: false,
							Remarks: false,
							Speed: false,
							['Running Hrs']: false,
							['Total Stoppages']: false,
							['Alert Receiving Time']: false,
							['Invoice No']: false,
							['Alert Status']: false,
						},
					},
				]);
			} else {
				if (!isGetAlertByUserDataLoading && alertsByUserData && alertsByUserData.length) {
					const alertOptionFilteredByUser = allAlertOptions.filter((option) =>
						alertsByUserData?.some(
							(alert: string | { status: string }) => (typeof alert === 'string' && alert === option.label) || option.label === 'All'
						)
					);

					setAlertOptions(alertOptionFilteredByUser);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGetAlertByUserDataLoading]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setPollingInterval((prevCount) => prevCount + 1);
			setCurrentTime(new Date());
		}, 300000);

		return () => clearInterval(intervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (userId) {
			getAlertsByDateTrigger({
				userId: userId,
				startDateTime: moment(new Date()).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
				endDateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
				alertType: selectedAlertOption.value,
				token: groupId,
				vehReg: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vehReg : 0,
				vehId: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vId : 0,
			}).then(({ data }) => {
				const isKMTAccount = isKmtAccount(Number(userId), Number(parentUser));
				let convertedDTCAlerts: AlertByDayEvents[] | null = null;
				if (isKMTAccount) {
					getDtcAlertsTrigger({ vehicleId: 0 }).then(({ data: dtcData }) => {
						if (dtcData && dtcData.list.length > 0) {
							convertedDTCAlerts = covertDtcToAlerts(dtcData.list, allVehicles);

							if (data) {
								getAdjustedAlerts({
									data: data.list,
									setAdjustAlertsAsList: setAdjustedAlertsAsList,
									setAlertCount,
									dtcAlerts: convertedDTCAlerts,
									selectedAlertOption: '',
									isDTC: true,
								});
							}
							setLoading(false);
							setFilteredColumns(filterColumns(selectedAlertOption.value));
						}
					});
				} else if (data) {
					getAdjustedAlerts({
						data: data.list,
						setAdjustAlertsAsList: setAdjustedAlertsAsList,
						setAlertCount,
						selectedAlertOption: '',
						isDTC: false,
					});
					setLoading(false);
					setFilteredColumns(filterColumns(selectedAlertOption.value));
				}
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	useEffect(() => {
		if (userId && isUninitialized === false) {
			fetchUpdatedAlerts({
				alertType: 'All',
				endTime: new Date(),
				isPolling: true,
				selectedAlertOptionValue: selectedAlertOption.label,
				isDTC: false,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pollingInterval, userId]);

	const filterColumns = (alertType: string) => {
		if (alertType === 'all') {
			return columns;
		}

		return columns.filter((column) => selectedAlertOption.columns[column.header?.toString().trim() as keyof AllColumnTypes]);
	};

	const fetchUpdatedAlerts = ({
		alertType,
		endTime,
		startTime,
		isPolling,
		selectedAlertOptionValue,
		isDTC,
	}: {
		alertType?: string;
		startTime?: Date;
		endTime?: Date;
		isPolling?: boolean;
		selectedAlertOptionValue?: string;
		isDTC: boolean;
	}) => {
		setLoading(true);

		getAlertsByDateTrigger({
			userId: userId,
			startDateTime: startTime
				? moment(startTime).format('YYYY-MM-DD HH:mm:ss')
				: customDateRange.length && customDateRange[0]
				? moment(customDateRange[0]?.toISOString()).format('YYYY-MM-DD HH:mm')
				: moment(new Date()).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
			endDateTime: endTime
				? moment(endTime).format('YYYY-MM-DD HH:mm:ss')
				: customDateRange.length && customDateRange[1]
				? moment(customDateRange[1]?.toISOString()).format('YYYY-MM-DD HH:mm')
				: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
			alertType: customDateRangeChanged ? 'All' : alertType || selectedAlertOption.value,
			token: groupId,
			vehReg: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vehReg : 0,
			vehId: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vId : 0,
		}).then(({ data }) => {
			const isKMTAccount = isKmtAccount(Number(userId), Number(parentUser));
			let convertedDTCAlerts: AlertByDayEvents[] | null = null;
			if (isKMTAccount) {
				getDtcAlertsTrigger({ vehicleId: 0 }).then(({ data: dtcData }) => {
					if (dtcData && dtcData.list.length > 0) {
						convertedDTCAlerts = covertDtcToAlerts(dtcData.list, allVehicles);

						if (data) {
							getAdjustedAlerts({
								data: data.list,
								setAdjustAlertsAsList: setAdjustedAlertsAsList,
								setAlertCount,
								dtcAlerts: convertedDTCAlerts,
								selectedAlertOption: alertType,
								isDTC: isDTC,
							});
							setLoading(false);
							setFilteredColumns(filterColumns(alertType ?? selectedAlertOption.value));
							setCustomDateRangeChanged(false);

							endTime ? setCurrentTime(endTime) : setCurrentTime(new Date());
							endTime && setCustomDateRange((prev) => [...prev, endTime]);
						}
					}
				});
			} else if (data) {
				getAdjustedAlerts({
					data: data.list,
					setAdjustAlertsAsList: setAdjustedAlertsAsList,
					setAlertCount,
					isPolling,
					selectedAlertOption: isPolling ? selectedAlertOptionValue : alertType,
					isDTC: isDTC,
				});
				setLoading(false);
				setFilteredColumns(filterColumns(alertType ?? selectedAlertOption.value));
				setCustomDateRangeChanged(false);

				endTime ? setCurrentTime(endTime) : setCurrentTime(new Date());
				endTime && setCustomDateRange((prev) => [...prev, endTime]);
			}
		});
	};

	const fetchUpdatedAlertsNotificationCard = (alertType?: string) => {
		setLoading(true);

		getAlertsByDateTrigger({
			userId: userId,
			startDateTime:
				customDateRange.length && customDateRange[0]
					? moment(customDateRange[0]?.toISOString()).format('YYYY-MM-DD HH:mm')
					: moment(new Date()).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
			endDateTime:
				customDateRange.length && customDateRange[1]
					? moment(customDateRange[1]?.toISOString()).format('YYYY-MM-DD HH:mm')
					: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
			alertType: customDateRangeChanged ? 'All' : alertType || selectedAlertOption.value,
			token: groupId,
			vehReg: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vehReg : 0,
			vehId: isKmtAccount(Number(userId), Number(parentUser)) ? selectedVehicle.vId : 0,
		}).then(({ data }) => {
			const isKMTAccount = isKmtAccount(Number(userId), Number(parentUser));
			let convertedDTCAlerts: AlertByDayEvents[] | null = null;
			if (isKMTAccount) {
				getDtcAlertsTrigger({ vehicleId: 0 }).then(({ data: dtcData }) => {
					if (dtcData && dtcData.list.length > 0) {
						convertedDTCAlerts = covertDtcToAlerts(dtcData.list, allVehicles);

						if (data) {
							getAdjustedAlerts({
								data: data.list,
								setAdjustAlertsAsList: setAdjustedAlertsAsList,
								setAlertCount,
								dtcAlerts: convertedDTCAlerts,
								selectedAlertOption: alertType,
								isDTC: true,
							});
							setLoading(false);
							setFilteredColumns(filterColumns(alertType ?? selectedAlertOption.value));
							setCurrentTime(new Date());
							setCustomDateRangeChanged(false);
						}
					}
				});
			} else if (data) {
				getAdjustedAlerts({
					data: data.list,
					setAdjustAlertsAsList: setAdjustedAlertsAsList,
					setAlertCount,
					selectedAlertOption: alertType,
					isDTC: false,
				});
				setLoading(false);
				setFilteredColumns(filterColumns(alertType ?? selectedAlertOption.value));
				setCurrentTime(new Date());
				setCustomDateRangeChanged(false);
			}
		});
	};

	return (
		<div>
			<Card
				styles={{ body: { padding: 0, background: '#F6F8F6', borderRadius: '15px', border: 0 } }}
				style={{ borderRadius: '15px', background: '#F6F8F6', border: 0 }}
			>
				<div className='w-full flex items-center justify-between'>
					<span className='text-3xl font-semibold m-5'>
						{isAlertManagement ? (
							<h1>
								<span className='text-2xl text-gray-600 cursor-pointer' onClick={() => setIsAlertManagement(false)}>
									Alerts{' '}
								</span>
								/ Alerts Management
							</h1>
						) : (
							<h1>Alerts</h1>
						)}
					</span>
					<div className='flex'>
						{isAlertManagement ? (
							<div>
								<Tooltip title='Create Alert' mouseEnterDelay={1}>
									<PlusCircleFilled
										className='text-xl mr-5'
										onClick={() => {
											setIsModalActive(true);
											setModalViewToggle('CREATE');
										}}
									/>
								</Tooltip>
							</div>
						) : (
							<div className='mr-5 flex gap-2 items-center'>
								{isKmtAccount(Number(userId), Number(parentUser)) ? <AllVehiclesSelect selectedStyles={selectedStyles} /> : null}

								<div className='w-[380px] max-w-[380px]'>
									<CustomDatePicker
										dateRange={customDateRange}
										setDateRange={(e) => {
											setCustomDateRange(e);
											setCustomDateRangeChanged(true);
										}}
										datePickerStyles='h-[32px]  max-h-[32px]'
										disabled={
											isGetAlertsByDateLoading || loading || alertCount.length === 0 || alertOptions === undefined || alertOptions.length === 0
										}
									/>
								</div>

								<Select
									className='w-[250px]'
									options={alertOptions}
									loading={isGetAlertsByDateLoading || loading || alertCount.length === 0 || alertOptions === undefined || alertOptions.length === 0}
									size='middle'
									disabled={isGetAlertsByDateLoading}
									value={selectedAlertOption.value}
									onChange={(_, value) => {
										if (!Array.isArray(value) && value) {
											setSelectedAlertOption(value);
										}
									}}
								/>
								<button
									className='bg-[#4FB090] text-white h-[29px] px-4 hover:bg-[#73BDA3] rounded-md'
									disabled={isGetAlertsByDateLoading || loading || alertCount.length === 0 || alertOptions === undefined || alertOptions.length === 0}
									onClick={() => {
										selectedAlertOption.label === 'Battery' ||
										selectedAlertOption.label === 'Brake' ||
										selectedAlertOption.label === 'Engine' ||
										selectedAlertOption.label === 'Tire' ||
										selectedAlertOption.label === 'Transmission' ||
										selectedAlertOption.label === 'Other' ||
										selectedAlertOption.label === 'Acceleration' ||
										selectedAlertOption.label === 'SafetySystems'
											? fetchUpdatedAlerts({ alertType: selectedAlertOption.label, isDTC: true })
											: fetchUpdatedAlerts({ isDTC: true });
									}}
								>
									Submit
								</button>
							</div>
						)}

						<Tooltip title={isAlertManagement ? 'Alerts' : 'Alerts Management'} mouseEnterDelay={1}>
							<SettingFilled className='text-xl mr-5' onClick={() => setIsAlertManagement((prev) => !prev)} />
						</Tooltip>
					</div>
				</div>
				{notificationContextHolder}
				{isAlertManagement ? (
					<AlertsManagement
						modalViewToggle={modalViewToggle}
						setModalViewToggle={setModalViewToggle}
						isModalActive={isModalActive}
						setIsModalActive={setIsModalActive}
						isDrawerActive={isDrawerActive}
						setIsDrawerActive={setIsDrawerActive}
						isServicesAndDocumentsDrawerActive={isServicesAndDocumentsDrawerActive}
						setIsServicesAndDocumentsDrawerActive={setIsServicesAndDocumentsDrawerActive}
					/>
				) : (
					<>
						{Number(userId) === 3356 ||
						Number(parentUser) === 3356 ||
						Number(userId) === 82815 ||
						Number(userId) === 87470 ||
						Number(parentUser) === 87470 ||
						(Number(parentUser) === 82815 && alertOptions && alertOptions.length > 0) ? (
							<div className='px-3 py-4 border-b-[0.5px] border-t-[0.5px] border'>
								<div className='grid grid-cols-7 grid-flow-row-dense gap-5 items-start'>
									<div className='col-span-2'>
										<h3 className='font-semibold text-lg mb-1'>Driver Behaviour</h3>
										<div className='flex flex-wrap gap-2'>
											{alertCount
												.filter((option) => option.type === 'DRIVER_BEHAVIOUR')
												.map((option) => (
													<div
														className='mb-2 cursor-pointer relative'
														key={option.value}
														onClick={() => {
															alertOptions &&
																alertOptions.forEach((alert) => {
																	if (alert.label === option.label) {
																		setSelectedAlertOption(alert);
																		setAlertCount((prev) =>
																			prev.map((prevOption) => {
																				if (prevOption.value === option.value) {
																					return {
																						...prevOption,
																						isNewData: false,
																					};
																				}
																				return prevOption;
																			})
																		);
																		fetchUpdatedAlerts({ alertType: alert.value, isDTC: false });
																	}
																});
														}}
													>
														{option.isNewData ? <div className='rounded-full bg-[#46ad6a] w-2.5 h-2.5 absolute -top-[3px] -left-[3px]' /> : null}
														<Tooltip title={option.label} mouseEnterDelay={1}>
															<div className='rounded-md text-xs border-[#709892] border bg-[#f9fcf7] text-[#43897E] p-1.5'>
																{option.title} ({option.count})
															</div>
														</Tooltip>
													</div>
												))}
										</div>
									</div>
									<div className='col-span-2'>
										<h3 className='font-semibold text-lg mb-1'>Others</h3>

										<div className='flex flex-wrap gap-2'>
											{alertCount
												.filter((option) => option.type === 'OTHERS')
												.map((option) => (
													<div
														className='mb-2 cursor-pointer relative'
														key={option.value}
														onClick={() => {
															alertOptions &&
																alertOptions.forEach((alert) => {
																	if (alert.label === option.label) {
																		setSelectedAlertOption(alert);
																		setAlertCount((prev) =>
																			prev.map((prevOption) => {
																				if (prevOption.value === option.value) {
																					return {
																						...prevOption,
																						isNewData: false,
																					};
																				}
																				return prevOption;
																			})
																		);
																		fetchUpdatedAlerts({ alertType: alert.value, isDTC: false });
																	}
																});
														}}
													>
														{option.isNewData ? <div className='rounded-full bg-[#46ad6a] w-2.5 h-2.5 absolute -top-[3px] -left-[3px]' /> : null}
														<Tooltip title={option.label} mouseEnterDelay={1}>
															<div className='rounded-md text-xs border-[#709892] border bg-[#f9fcf7] text-[#43897E] p-1.5'>
																{option.title} ({option.count})
															</div>
														</Tooltip>
													</div>
												))}
										</div>
									</div>

									<div className='col-span-3'>
										<h3 className='font-semibold text-lg mb-1'>DTC</h3>

										<div className='flex flex-wrap gap-2'>
											{alertCount
												.filter((option) => option.type == 'DTC')
												.map((option) => (
													<div
														className='mb-2 cursor-pointer relative'
														key={option.value}
														onClick={() => {
															alertOptions &&
																alertOptions.forEach((alert) => {
																	if (alert.label === option.label) {
																		setSelectedAlertOption(alert);
																		setAlertCount((prev) =>
																			prev.map((prevOption) => {
																				if (prevOption.value === option.value) {
																					return {
																						...prevOption,
																						isNewData: false,
																					};
																				}
																				return prevOption;
																			})
																		);

																		fetchUpdatedAlerts({ alertType: option.label, isDTC: true });
																	}
																});
														}}
													>
														{option.isNewData ? <div className='rounded-full bg-[#46ad6a] w-2.5 h-2.5 absolute -top-[3px] -left-[3px]' /> : null}
														<Tooltip title={option.label} mouseEnterDelay={1}>
															<div className='rounded-md text-xs border-[#709892] border bg-[#f9fcf7] text-[#43897E] p-1.5'>
																{option.title} ({option.count})
															</div>
														</Tooltip>
													</div>
												))}
										</div>
									</div>
								</div>
							</div>
						) : null}
						<div className='relative'>
							<div className='mr-3 flex-row items-center gap-2 absolute right-11 top-2'>
								<p className='text-neutral-700 text-sm font-semibold'>Last Updated</p>
								<p className='text-neutral-400 text-xs'>{currentTime.toLocaleString('en-US', { hour12: true })}</p>
							</div>
							<AlertsReportTable
								adjustedAlertsAsList={adjustedAlertsAsList}
								loading={loading || alertCount.length === 0 || alertOptions === undefined || alertOptions.length === 0}
								columns={filteredColumns || []}
								selectedAlert={selectedAlertOption.label}
							/>
						</div>
					</>
				)}
			</Card>
		</div>
	);
};
