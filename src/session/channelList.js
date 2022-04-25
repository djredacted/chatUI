import { writable } from 'svelte/store'

function createChannelList() {
	const { subscribe, set, update } = writable(['djredacted']) // sets on load 

	// TODO:: UI to activate this
	const add = (newChannel) => {
		update(c => c = [...c, newChannel])
	}

	const remove = (i) => {
		alert('TODO:: Add this feature')
	}

	return {
		subscribe,
		add,
		remove,
		reset: () => set([])
	}
}

export const channelList = createChannelList();
