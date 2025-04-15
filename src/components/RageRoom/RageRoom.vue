<template>
  <div class="rage-room">
    <h1>Rage Room</h1>
    <p>Click objects to interact with them</p>

    <div class="controls">
      <button @click="resetRoom">Reset Room</button>
      <button @click="addObject">Add Object</button>
    </div>

    <!-- Added wrapper div for better canvas control -->
    <div class="room-wrapper">
      <div class="room-container" ref="roomContainer"></div>
    </div>

    <div class="debug">
      Objects in room: {{ objectCount }}
      <span v-if="engineError" style="color: red"> | Error: {{ engineError }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Matter from 'matter-js'

export default {
  setup() {
    const roomContainer = ref(null)
    const engine = ref(null)
    const render = ref(null)
    const world = ref(null)
    const engineError = ref(null)
    const objects = ref([])

    const objectCount = computed(() => objects.value.length)

    const initPhysics = () => {
      try {
        // Engine module checks
        if (!Matter || !Matter.Engine) {
          throw new Error('Matter.js not properly loaded')
        }

        // 1. Create engine
        engine.value = Matter.Engine.create({
          gravity: { y: 0.5 },
          enableSleeping: true,
        })
        world.value = engine.value.world

        // 2. Verify DOM element
        if (!roomContainer.value) {
          throw new Error('Room container element not found')
        }

        // 3. Create renderer with explicit dimensions
        const width = Math.min(800, window.innerWidth - 40)
        const height = 500

        render.value = Matter.Render.create({
          element: roomContainer.value,
          engine: engine.value,
          options: {
            width: width,
            height: height,
            wireframes: false,
            background: '#222222',
            showAngleIndicator: false,
          },
        })

        // 4. Create boundaries
        const wallOptions = {
          isStatic: true,
          render: { fillStyle: '#444444' },
        }
        const walls = [
          Matter.Bodies.rectangle(width/2, 0, width, 20, wallOptions), // top
          Matter.Bodies.rectangle(width/2, height, width, 20, wallOptions), // bottom
          Matter.Bodies.rectangle(0, height/2, 20, height, wallOptions), // left
          Matter.Bodies.rectangle(width, height/2, 20, height, wallOptions), // right
        ]
        Matter.Composite.add(world.value, walls)

        // 5. Add mouse control
        const mouse = Matter.Mouse.create(render.value.canvas)
        const mouseConstraint = Matter.MouseConstraint.create(engine.value, {
          mouse: mouse,
          constraint: {
            stiffness: 0.2,
            render: { visible: false },
          },
        })
        Matter.Composite.add(world.value, mouseConstraint)

        // 6. Run the engine
        Matter.Render.run(render.value)
        const runner = Matter.Runner.create()
        Matter.Runner.run(runner, engine.value)

        // 7. Add initial objects
        for (let i = 0; i < 5; i++) {
          addObject()
        }

      } catch (error) {
        engineError.value = error.message
        console.error('Physics initialization error:', error)
      }
    }

    const addObject = () => {
      if (!render.value || !world.value) return

      const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6b81']
      const color = colors[Math.floor(Math.random() * colors.length)]
      const width = render.value.options.width
      const height = render.value.options.height

      const object = Matter.Bodies.rectangle(
        Math.random() * (width - 100) + 50,
        Math.random() * (height - 100) + 50,
        50 + Math.random() * 50,
        50 + Math.random() * 50,
        {
          render: { fillStyle: color },
          restitution: 0.7,
        }
      )

      Matter.Composite.add(world.value, object)
      objects.value.push(object)
    }

    const resetRoom = () => {
      if (!world.value) return

      objects.value.forEach((obj) => {
        Matter.Composite.remove(world.value, obj)
      })
      objects.value = []

      for (let i = 0; i < 5; i++) {
        addObject()
      }
    }

    onMounted(() => {
      nextTick(() => {
        initPhysics()
      })
    })

    onUnmounted(() => {
      if (render.value) {
        Matter.Render.stop(render.value)
        render.value.canvas.remove()
      }
      if (engine.value) {
        Matter.Engine.clear(engine.value)
      }
    })

    return {
      roomContainer,
      addObject,
      resetRoom,
      objectCount,
      engineError,
    }
  },
}
</script>

<style scoped>
.rage-room {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.room-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.room-container {
  width: 100%;
  height: 500px;
  background-color: #111;
  border: 2px solid #333;
  border-radius: 5px;
  overflow: hidden;
}

/* Ensure canvas fills container */
.room-container canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.controls {
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  margin: 0 10px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #ff6b81;
}

.debug {
  margin-top: 20px;
  color: #666;
  font-family: monospace;
}

@media (max-width: 800px) {
  .room-container {
    height: 400px;
  }
}

@media (max-width: 600px) {
  .room-container {
    height: 300px;
  }
  
  .controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  button {
    width: 100%;
    margin: 5px 0;
  }
}
</style>