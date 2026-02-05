<script lang="ts">
  import { T } from '@threlte/core';
  import { interactivity } from '@threlte/extras';

  interface Props {
    position?: [number, number, number];
    color?: string;
    scale?: number;
  }

  let { position = [0, 0, 0], color = '#ff3e00', scale = 1 }: Props = $props();

  let hovered = $state(false);
  let rotation = $state(0);

  interactivity();

  $effect(() => {
    const interval = setInterval(() => {
      rotation += 0.01;
    }, 16);
    return () => clearInterval(interval);
  });
</script>

<T.Mesh
  position.x={position[0]}
  position.y={position[1]}
  position.z={position[2]}
  rotation.y={rotation}
  scale={hovered ? scale * 1.2 : scale}
  onpointerenter={() => hovered = true}
  onpointerleave={() => hovered = false}
>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial {color} />
</T.Mesh>
