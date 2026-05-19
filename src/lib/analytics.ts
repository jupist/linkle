const KEY = 'linkle:analytics';

type Session = {
	profile: string;
	date: string;
	guesses: number;
	solved: boolean;
	duration: number;
};

type Analytics = {
	version: '1';
	player: {
		firstplayed: string;
		lastplayed: string;
		gamesplayed: number;
		gamessolved: number;
		currentstreak: number;
		beststreak: number;
	};
	sessions: Session[];
};

function load(): Analytics | null {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function save(data: Analytics) {
	localStorage.setItem(KEY, JSON.stringify(data));
}

function init(): Analytics {
	const now = new Date().toISOString();
	return {
		version: '1',
		player: {
			firstplayed: now,
			lastplayed: now,
			gamesplayed: 0,
			gamessolved: 0,
			currentstreak: 0,
			beststreak: 0
		},
		sessions: []
	};
}

export function recordsession(
	profileid: string,
	guesses: number,
	solved: boolean,
	duration: number
) {
	const data = load() ?? init();
	const now = new Date().toISOString();

	data.sessions.push({ profile: profileid, date: now, guesses, solved, duration });

	data.player.lastplayed = now;
	data.player.gamesplayed++;
	if (solved) {
		data.player.gamessolved++;
		data.player.currentstreak++;
		if (data.player.currentstreak > data.player.beststreak) {
			data.player.beststreak = data.player.currentstreak;
		}
	} else {
		data.player.currentstreak = 0;
	}

	save(data);
}

export function exportanalytics() {
	const data = load();
	if (!data) return;
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'linkle-analytics.json';
	a.click();
	URL.revokeObjectURL(url);
}
