<script lang="ts">
	let websiteUrl = '';
	let html: string;

	async function handleClick() {
		html = await (
			await fetch(`/browser/${encodeURIComponent(websiteUrl)}`, {
                method: 'POST',
            })
		).text();
	}
</script>

<div>
	<input type="text" bind:value={websiteUrl} />
	<button on:click={handleClick}>Go</button>
</div>

<div>
	{#if html}
		{@html html}
	{/if}
</div>
