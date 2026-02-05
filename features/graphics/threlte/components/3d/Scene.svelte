<script lang="ts">
  import { Canvas } from '@threlte/core';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<Canvas>
  {#if children}
    {@render children()}
  {/if}
</Canvas>

<style>
  :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
