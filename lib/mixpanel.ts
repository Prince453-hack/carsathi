import mixpanel, { Dict } from 'mixpanel-browser';
mixpanel.init('05b3a09be07c449ce5181dbe8c3bcf67');

// let env_check = process.env.NEXT_PUBLIC_ENV === 'PRODUCTION';

let actions = {
	identify: (ids: string) => {
		mixpanel.identify(ids);
	},
	alias: (id: string) => {
		mixpanel.alias(id);
	},
	track: (name: string, props?: Dict) => {
		mixpanel.track(name, props);
	},
	people: {
		set: (props: Dict) => {
			mixpanel.people.set(props);
		},
	},
};

export let Mixpanel = actions;
