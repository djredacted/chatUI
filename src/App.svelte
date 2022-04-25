<!-- JS -->
<script>
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import './tmi.js'
	// Session Data
	import { channelList } from './session/channelList.js'

	// import { fake_messages } from './data/fake_messages.js';
	import { blocked_messages } from './data/blocked_messages.js';
	const messages = writable([]); 

	// BOT LOGIN (account info)
	const botID = [
		'usr': 'botname', 
		'pwd': 'from https://twitchapps.com/tmi', 
	]

	let autoscroll = true
	let messageBox; // HTML element

	let client;
	onMount(() => {
		// create client
		client = new tmi.Client({
			options: { debug: true, messagesLogLevel: "info" },
			connection: { reconnect: true, secure: true },
			identity: {
				username: botID.usr,
				password: botID.pwd
			},
			channels: $channelList,
		});

		client.connect().catch('ERROR CONNECTING', console.error);

		client.on('message', (channel, tags, message, self) => {
			if(self) return;

			let newMsg = {
				"class": "",
				"username": tags.username,
				"color": tags.color,
				"message": message
			}

			// TODO:: if tags.color exists, apply color

			// push for UI to display
			messages.update(m => m = [...m, normalizeMsg(newMsg, tags)])

			// Talk Bot
			if(message.toLowerCase() === '!hello') {
				client.say(channel, `@${tags.username}, heya!`);
			}

			// Scroll down on new message
			if (autoscroll) {
				messageBox.scrollTop = messageBox.scrollHeight
			}
		});
	})

	function normalizeMsg(msg, tags) {
		/* BUG::
			if message has 50 characters with no space,
				> break it up?
				> force word wrap in CSS?
		*/

		// first time chatter
		if (tags['first-msg']) {
			msg.class = "FirstMsg"
		}

		// block message
		if (blocked_messages.includes(msg['message'])) {
			msg.class = "Blocked"
			alert('Blocked one!')
			msg['message'] = msg['message'].slice(0,8) + "...";
		}
		return msg

	}

	function clipstr(str) {
		return str.slice(0,9) + '..';
	}

	const hdlAddChannel = () => {
		alert("Lets add new channel")
	}
</script>

<!-- HTML -->
<div class="Home">
	<section>

		<div class="Topbar">

			<div class="Logo">
				<h1>ChatUI ({$messages.length})</h1>
			</div>

			<div class="ChannelRow">
				<div class="Channels">
					{#if $channelList.length === 0}
						<p>Add channel?</p>
					{:else}
						{#each $channelList as item}
							<p>{item}</p>
						{/each}
					{/if}
				</div>
				<div class="Actions">
					<code title="Add channel" on:click={hdlAddChannel}>
						➕
					</code>
					<!-- <code title="Remove Channel">➖</code> -->
				</div>
			</div>

			<div class="Settings">
				<h4 class:Active={autoscroll} class="NoSelect"
					on:click={() => autoscroll = !autoscroll}>
					{#if autoscroll}
						Autoscrolling
					{:else}
						Autoscroll off
					{/if}
				</h4>
			</div>
		</div>

		<div class="Messages" bind:this={messageBox}>
			{#each $messages as m}
				<div class={`Row ${m.class}`}>
					{#if m.username.length > 10}
						<p class="Username" title={m.username} >
							{clipstr(m.username)}:
						</p>
					{:else}
						<p class="Username" >
							{m.username}:
						</p>
					{/if}
					<p class="Message">{m.message}</p>
				</div>
			{/each}
		</div>

	</section>
</div>

<!-- CSS -->
<style lang=scss>
	.Home {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		// backdrop-filter: blur(2rem);

		section {
			min-height: 33vh;
			width: 90%;
			max-width: 800px;
			background: url('../app_bg.jpg') no-repeat center center fixed;
			background-size: cover;
			padding: 0.3rem;
			margin-top: 2rem;
			border-radius: 0.6rem;
			border: 0.3rem solid rgba(30,31,33,0.86);
			box-shadow:
				rgba(14,14,14,0.3) 0px 0.15rem 0.9rem,
				rgba(28,28,28,0.8) 0px 4px 6px,
				rgba(236,238,242,0.1) 0px 2px 9px,
				rgba(136,138,142,0.3) -1px -1px 3px;

			// --------------
			.Topbar {
				display: flex;
				justify-content: space-between;
				text-align: center;

				// Topbar height
				h1, h4, p, code {
					margin: 0 0.3rem;
					line-height: 2.4rem;
				} // (all text tags)

				.Logo {
					color: rgba(252,252,252,0.2);
					width: 100%;
					max-width: calc(11 * 20px);
					background: rgba(0,0,0,051);
					border-radius: 0.6rem 0 0 0;
					&:hover {
						color: rgba(252,252,252,0.5);

					}
				}

				.ChannelRow {
					display: flex;

					.Channels {
						display: flex;
						justify-content: center;
						// grid-gap: 3px;
						max-width: 320px;
						overflow: auto;
						p {
							display: block;
							padding: 0 0.3rem;
							background: rgba(252,252,222,1);
						}
					} // Channels

					.Actions {
						display: flex;
						justify-content: space-between;
						align-items: center;
						grid-gap: 5px;
						padding: 0 5px;
						code {
							line-height: calc(2.4rem / 6);
							padding: calc(2.4rem / 4);
							background: rgba(212,212,212,1);
							border-radius: 9px;
							border: 1px solid rgba(30,31,33,0.1);

						}
					}

				} // ChannelRow

				.Settings {
					display: flex;
					justify-content: space-around;

					h4 {
						cursor: pointer;
						color: rgba(252,252,252,0.3);
						min-width: 120px;
						border-radius: 0.3rem;

						&.Active {
							color: rgba(98,191,98,1);
						} // Active scrolling
					} // h4 (Autoscroll label)

				} // Settings
			} // Topbar

			// --------------
			.Messages {
				max-height: calc(100vh - 9.3rem);
				overflow: auto;
				display: grid;

				.Row {
					display: flex;
					width: 98%;
					margin: 0.3 auto;
					p {
						margin: 0.3rem 0;
						line-height: 2rem;
						padding: 0.9rem 0;
						font-size: 1.5rem;
						max-width: 100%;
					} // p (all text)
					.Username {
						// TODO:: SET color IN JS 
						color: rgba(222,222,222,0.9);
						padding-right: 6px;
						cursor: pointer;
					}

					.Message {
						color: rgba(192,192,192,1);
						width: 100%;
					}
					
					&:hover {
						background: rgba(169,167,192,0.2);
					}
					&.FirstMsg {
						color: rgba(166, 236, 163, 0.32);
						background: rgba(0,252,0,0.12);
						&:hover {
							background: rgba(0,252,0,0.24);
						}
					}
					&.Blocked {
						color: rgba(166, 236, 163, 0.32);
						background: rgba(252,0,0,0.12);
						&:hover {
							background: rgba(252,0,0,0.24);
						}
					}

				} // Message
			} // Messages
		} // section
	} // Home


	/* --- MIXINS --- */
	/* TODO:: Actually make it a mixin */
	.NoSelect {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		user-select: none;
	}
</style>
