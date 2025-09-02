module.exports = {
	async rewrites() {
		return [
			{
				source: '/proxy/:path*',
				destination: 'https://idp-integ.federate.amazon.com/:path*',
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: '103.91.90.235',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'gtrac.in',
				port: '',
			},
		],
	},

	webpack: (config, { isServer }) => {
		// Add a rule to handle audio files
		config.module.rules.push({
			test: /\.(mp3|wav|ogg)$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'static/assets/audio/',
						publicPath: '/_next/static/assets/audio/',
					},
				},
			],
		});

		// Important: return the modified config
		return config;
	},
};
