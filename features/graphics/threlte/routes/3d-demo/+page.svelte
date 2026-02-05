<script lang="ts">
  import { Scene, Box } from '$lib/components/3d';
  import { T } from '@threlte/core';
</script>

<svelte:head>
  <title>3D Demo</title>
</svelte:head>

<div class="scene-container">
  <Scene>
    <T.PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50}>
      <T.OrbitControls enableDamping />
    </T.PerspectiveCamera>

    <T.DirectionalLight position={[10, 10, 10]} intensity={1} />
    <T.AmbientLight intensity={0.5} />

    <Box position={[-2, 0, 0]} color="#ff3e00" />
    <Box position={[0, 0, 0]} color="#40b3ff" />
    <Box position={[2, 0, 0]} color="#ffce3a" />

    <T.GridHelper args={[10, 10]} />
  </Scene>
</div>

<style>
  .scene-container {
    width: 100%;
    height: 100vh;
  }
</style>
