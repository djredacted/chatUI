import 'dotenv';
import * as test from 'tmi';
import { writable } from 'svelte/store';

const messages = writable('');

const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443')

socket.addEventListener('open', (e) => {
	console.log('Connection made', e);
})

socket.addEventListener('open', (e) => {
	messages.set(e.data);
})

export default {
	subscribe: messages.subscribe
}
