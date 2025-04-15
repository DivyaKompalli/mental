<template>
  <div class="rage-room">
    <h1>Rage Room</h1>
    <p>Tap objects to interact with them</p>

    <div class="controls">
      <button @click="resetRoom" @touchstart="resetRoom">Reset Room</button>
      <button @click="addObject" @touchstart="addObject">Add Object</button>
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
    const isMobile = ref(false)

    const objectCount = computed(() => objects.value.length)

    const initPhysics = () => {
      try {
        // Check if mobile
        isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )

        // 1. Create engine
        engine.value = Matter.Engine.create({
          gravity: { y: 0.5 },
          enableSleeping: true,
        })
        world.value = engine.value.world

        if (!roomContainer.value) {
          throw new Error('Room container element not found')
        }

        // 2. Create renderer with responsive dimensions
        const containerWidth = Math.min(800, window.innerWidth - 40)
        const containerHeight = Math.min(500, window.innerHeight * 0.6)

        render.value = Matter.Render.create({
          element: roomContainer.value,
          engine: engine.value,
          options: {
            width: containerWidth,
            height: containerHeight,
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
          Matter.Bodies.rectangle(containerWidth / 2, 0, containerWidth, 20, wallOptions), // top
          Matter.Bodies.rectangle(
            containerWidth / 2,
            containerHeight,
            containerWidth,
            20,
            wallOptions,
          ), // bottom
          Matter.Bodies.rectangle(0, containerHeight / 2, 20, containerHeight, wallOptions), // left
          Matter.Bodies.rectangle(
            containerWidth,
            containerHeight / 2,
            20,
            containerHeight,
            wallOptions,
          ), // right
        ]
        Matter.Composite.add(world.value, walls)

        // 4. Add touch/mouse control
        const mouse = Matter.Mouse.create(render.value.canvas)
        const mouseConstraint = Matter.MouseConstraint.create(engine.value, {
          mouse: mouse,
          constraint: {
            stiffness: isMobile.value ? 0.1 : 0.2, // Less stiffness for touch
            render: { visible: false },
          },
        })
        Matter.Composite.add(world.value, mouseConstraint)

        // Enable touch events
        if (isMobile.value) {
          render.value.canvas.style.touchAction = 'none'
          render.value.canvas.addEventListener('touchstart', (e) => e.preventDefault(), {
            passive: false,
          })
        }

        // 5. Run the engine
        Matter.Render.run(render.value)
        Matter.Runner.run(Matter.Runner.create(), engine.value)

        // 6. Add initial objects (fewer on mobile)
        const initialObjects = isMobile.value ? 3 : 5
        for (let i = 0; i < initialObjects; i++) {
          addObject()
        }

        // Handle window resize
        window.addEventListener('resize', handleResize)
      } catch (error) {
        engineError.value = error.message
        console.error('Physics init error:', error)
      }
    }

    const handleResize = () => {
      if (render.value && engine.value) {
        const containerWidth = Math.min(800, window.innerWidth - 40)
        const containerHeight = Math.min(500, window.innerHeight * 0.6)

        render.value.options.width = containerWidth
        render.value.options.height = containerHeight
        Matter.Render.setPixelRatio(render.value, window.devicePixelRatio)

        // Reset walls
        Matter.Composite.clear(world.value, false)
        const wallOptions = {
          isStatic: true,
          render: { fillStyle: '#444444' },
        }
        const walls = [
          Matter.Bodies.rectangle(containerWidth / 2, 0, containerWidth, 20, wallOptions),
          Matter.Bodies.rectangle(
            containerWidth / 2,
            containerHeight,
            containerWidth,
            20,
            wallOptions,
          ),
          Matter.Bodies.rectangle(0, containerHeight / 2, 20, containerHeight, wallOptions),
          Matter.Bodies.rectangle(
            containerWidth,
            containerHeight / 2,
            20,
            containerHeight,
            wallOptions,
          ),
        ]
        Matter.Composite.add(world.value, walls)

        // Re-add objects
        objects.value.forEach((obj) => Matter.Composite.add(world.value, obj))
      }
    }

    const addObject = () => {
      if (!render.value || !world.value) return

      const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6b81']
      const color = colors[Math.floor(Math.random() * colors.length)]

      const containerWidth = render.value.options.width
      const containerHeight = render.value.options.height

      const object = Matter.Bodies.rectangle(
        Math.random() * (containerWidth - 100) + 50,
        Math.random() * (containerHeight - 100) + 50,
        30 + Math.random() * (isMobile.value ? 30 : 50), // Smaller on mobile
        30 + Math.random() * (isMobile.value ? 30 : 50),
        {
          render: { fillStyle: color },
          restitution: 0.7,
          friction: 0.1, // Less friction for better mobile experience
        },
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

      const initialObjects = isMobile.value ? 3 : 5
      for (let i = 0; i < initialObjects; i++) {
        addObject()
      }
    }

    onMounted(() => {
      initPhysics()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
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
  padding: 15px;
  text-align: center;
  font-family: Arial, sans-serif;
  max-width: 100%;
  overflow-x: hidden;
}

.room-container {
  width: 100%;
  max-width: 800px;
  height: 60vh;
  min-height: 300px;
  max-height: 500px;
  margin: 15px auto;
  background-color: #111;
  border: 2px solid #333;
  border-radius: 5px;
  touch-action: none;
}

.controls {
  margin: 15px 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  padding: 12px 24px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  min-width: 120px;
  touch-action: manipulation;
}

button:active {
  background-color: #ff6b81;
  transform: scale(0.98);
}

.debug {
  margin-top: 15px;
  color: #666;
  font-family: monospace;
  font-size: 14px;
}

@media (max-width: 600px) {
  .rage-room {
    padding: 10px;
  }

  h1 {
    font-size: 24px;
  }

  p {
    font-size: 14px;
  }

  button {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 100px;
  }

  .room-container {
    height: 50vh;
    min-height: 250px;
  }
}

@media (max-width: 400px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }

  button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
