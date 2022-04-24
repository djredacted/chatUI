<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import './tmi.js';

	// ['(username):(msg)',...]
	const messages = writable([])

	let client;
	onMount(() => {
		client = new tmi.Client({
			options: { debug: true, messagesLogLevel: "info" },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: 'scrapperbot2000',
				password: 'secret'
			},
			channels: [ 'djredacted' ]
		});

		client.connect().catch(console.error);

		client.on('message', (channel, tags, message, self) => {
			if(self) return;

			let newMsg = {
				"class": "",
				"message":`${tags.username}: ${message}`
			}

			if (tags['first-msg']) {
				// First message in chat
				newMsg.class = "FirstTimer"
				// TODO: Add to ChatDB
			}

			// push for UI to display
			messages.update(m => m = [...m, newMsg])

			// Bot commands
			if(message.toLowerCase() === '!hello') {
				client.say(channel, `@${tags.username}, heya!`);
			}
		});
	})
</script>

<div class="Home">
	<section>
		<h1>CHAT UI</h1>
		<div class="Messages">
			{#each $messages as m}
				<p class={m.class}>{m.message}</p>
			{/each}
		</div>
	</section>
</div>

<style lang=scss>
	.Home {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(30,31,33,1);

		section {
			background: rgba(240,240,240,1);
			width: 90%;
			max-width: 720px;

			.Messages {
				height: 80vh;
				overflow: auto;

				p {
					cursor: pointer;
					line-height: 2rem;
					font-size: 1.5rem;
					background: rgba(222,222,222,1);

					&:hover {
						background: white;
					}

					&.FirstTimer {
						background: rgba(190,252,190,1);
						&:hover {
							background: rgba(216,255,216,1);
						}
					}

				} // p
			} // Messages
		} // section
	} // Home
</style>