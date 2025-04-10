<template>
  <div class="rage-room">
    <h1>Rage Room</h1>
    <p>Click objects to interact with them</p>

    <div class="controls">
      <button @click="resetRoom">Reset Room</button>
      <button @click="addObject">Add Object</button>
    </div>

    <div class="room-container" ref="roomContainer"></div>

    <div class="debug">
      Objects in room: {{ objectCount }}
      <span v-if="engineError" style="color: red"> | Error: {{ engineError }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
        // 1. Create engine
        engine.value = Matter.Engine.create({
          gravity: { y: 0.5 },
          enableSleeping: true,
        })
        world.value = engine.value.world

        // 2. Create renderer
        if (!roomContainer.value) {
          throw new Error('Room container element not found')
        }

        render.value = Matter.Render.create({
          element: roomContainer.value,
          engine: engine.value,
          options: {
            width: 800,
            height: 500,
            wireframes: false,
            background: '#222222',
            showAngleIndicator: false,
          },
        })

        // 3. Create boundaries
        const wallOptions = {
          isStatic: true,
          render: { fillStyle: '#444444' },
        }
        const walls = [
          Matter.Bodies.rectangle(400, 0, 800, 20, wallOptions), // top
          Matter.Bodies.rectangle(400, 500, 800, 20, wallOptions), // bottom
          Matter.Bodies.rectangle(0, 250, 20, 500, wallOptions), // left
          Matter.Bodies.rectangle(800, 250, 20, 500, wallOptions), // right
        ]
        Matter.Composite.add(world.value, walls)

        // 4. Add mouse control
        const mouse = Matter.Mouse.create(render.value.canvas)
        const mouseConstraint = Matter.MouseConstraint.create(engine.value, {
          mouse: mouse,
          constraint: {
            stiffness: 0.2,
            render: { visible: false },
          },
        })
        Matter.Composite.add(world.value, mouseConstraint)

        // 5. Run the engine
        Matter.Render.run(render.value)
        Matter.Runner.run(Matter.Runner.create(), engine.value)

        // 6. Add initial objects
        for (let i = 0; i < 5; i++) {
          addObject()
        }
      } catch (error) {
        engineError.value = error.message
        console.error('Physics init error:', error)
      }
    }

    const addObject = () => {
      const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6b81']
      const color = colors[Math.floor(Math.random() * colors.length)]

      const object = Matter.Bodies.rectangle(
        Math.random() * 700 + 50,
        Math.random() * 300 + 50,
        50 + Math.random() * 50,
        50 + Math.random() * 50,
        {
          render: { fillStyle: color },
          restitution: 0.7, // bounciness
        },
      )

      Matter.Composite.add(world.value, object)
      objects.value.push(object)
    }

    const resetRoom = () => {
      // Clear all objects except walls
      objects.value.forEach((obj) => {
        Matter.Composite.remove(world.value, obj)
      })
      objects.value = []

      // Add new objects
      for (let i = 0; i < 5; i++) {
        addObject()
      }
    }

    onMounted(() => {
      initPhysics()
    })

    onUnmounted(() => {
      if (render.value) Matter.Render.stop(render.value)
      if (engine.value) Matter.Engine.clear(engine.value)
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

.room-container {
  width: 800px;
  height: 500px;
  margin: 20px auto;
  background-color: #111;
  border: 2px solid #333;
  border-radius: 5px;
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
</style>
