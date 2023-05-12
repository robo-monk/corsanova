<script lang="ts">
	import {
		Row,
		Button,
		Col,
		Input,
		Form,
		InputGroup,
		Modal,
		Container,
		ListGroup,
		ListGroupItem,
	} from 'sveltestrap';
	import { localStorageStore } from '../lib/localStorageStore';
	import { writable } from 'svelte/store';

	interface Snippet {
		title: string;
		code: string;
	}
	let snippets = localStorageStore<Snippet[]>('snippets', []);

	let websiteUrl = '';
	let html: string;

	let modalSnippetOpen = false;

	let snippetTitle = '';
	let customJs = '';
	async function handleClick() {
		html = '';
		html = await (
			await fetch(`/browser/${encodeURIComponent(websiteUrl)}`, {
				method: 'POST',
			})
		).text();
	}

	async function addSnippet() {
		$snippets = [
			...$snippets,
			{
				title: snippetTitle,
				code: customJs,
			},
		];
		modalSnippetOpen = false;
	}
</script>

<Row>
	<Col>
		<Form>
			<InputGroup>
				<Input type="text" bind:value={websiteUrl} placeholder="https://google.com" />
				<Button color="primary" on:click={handleClick} type="submit">Go</Button>
			</InputGroup>
		</Form>
	</Col>

	<Col>
		<Button on:click={() => (modalSnippetOpen = true)}>Add JavaScript snippet</Button>
	</Col>
</Row>

<Modal isOpen={modalSnippetOpen}>
	<ListGroup class="p-2">
		{#each $snippets as snippet}
			<ListGroupItem>
				<Row>
					<Col sm='8'>
						{snippet.title}
					</Col>
					<Col sm='2'>
						<Button color="primary" on:click={() => 
							{
								const script = document.createElement('script');
								script.innerHTML = snippet.code;
								document.body.appendChild(script);
							}
						}>Inject</Button>
					</Col>
					<Col sm='2'>
						<Button color="danger" on:click={() => ($snippets = $snippets.filter((s) => s !== snippet))}>Del</Button>
					</Col>
				</Row>
			</ListGroupItem>
		{/each}
	</ListGroup>

	<Form class="p-2">
		<!-- title for your snipet -->
		<Input type="text" placeholder="Snippet title" class="mb-2" bind:value={snippetTitle} />
		<InputGroup>
			<Input type="textarea" bind:value={customJs} placeholder="alert(1)" />
			<Button color="primary" on:click={addSnippet} type="submit">Add</Button>
		</InputGroup>
	</Form>
</Modal>

<div>
	{#if html}
		{@html html}
	{/if}
</div>
