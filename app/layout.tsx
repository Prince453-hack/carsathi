export const revalidate = 0;
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { proximaNova } from './_assets/fonts/fonts_def';
import { AntdRegistry } from '@ant-design/nextjs-registry';

import './globals.css';
import Providers from './_globalRedux/provider';
import { ConfigProvider } from 'antd';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata: Metadata = {
	title: 'Gtrac',
};

const theme = {
	token: {
		colorPrimary: '#4fb090',
		colorInfo: '#458d82',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={proximaNova.className}>
				<UserProvider>
					<Providers>
						<ConfigProvider theme={theme}>
							<AntdRegistry>{children}</AntdRegistry>
						</ConfigProvider>
					</Providers>
				</UserProvider>
			</body>
		</html>
	);
}
