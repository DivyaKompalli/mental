<template>
  <div class="emotion-sculptor">
    <!-- VR Mode Toggle -->

    <div class="vr-toggle">
      <button @click="toggleVR" :disabled="!isWebXRAvailable">
        {{ vrMode ? 'Exit VR' : 'Enter VR' }}
        <i class="fas fa-vr-cardboard"></i>
        <span v-if="!isWebXRAvailable" class="tooltip">WebXR not available in your browser</span>
      </button>
    </div>

    <!-- Desktop Interface -->
    <div v-if="!vrMode" class="desktop-interface">
      <div ref="canvasContainer" class="canvas-container"></div>

      <div class="controls">
        <!-- <img src="../assets/images/sculpture.jpg" alt="Logo" class="logo" /> -->
        <div class="emotion-palette">
          <div
            v-for="emotion in enhancedEmotions"
            :key="emotion.name"
            class="emotion-card"
            @click="selectEmotion(emotion)"
            :style="{
              background: `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.secondaryColor} 100%)`,
              transform: selectedEmotion?.name === emotion.name ? 'scale(1.05)' : 'scale(1)',
            }"
          >
            <div class="emotion-icon">{{ emotion.icon }}</div>
            <div class="emotion-name">{{ emotion.name }}</div>
            <div class="emotion-intensity">
              <input type="range" v-model="emotion.intensity" min="1" max="10" @click.stop />
            </div>
          </div>
        </div>

        <div class="tool-palette">
          <button
            v-for="tool in tools"
            :key="tool.name"
            @click="selectTool(tool)"
            :class="{ active: currentTool?.name === tool.name }"
          >
            <i :class="tool.icon"></i>
            <span>{{ tool.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VR Interface -->
    <div v-else class="vr-interface">
      <div class="vr-notice">
        <p>Put on your VR headset and use motion controllers to sculpt</p>
        <button @click="toggleVR">Exit VR</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import WebXRPolyfill from 'webxr-polyfill'

export default {
  setup() {
    // Core Three.js elements
    const canvasContainer = ref(null)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    let controls = null
    let clayObject = null
    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2()
    let isMouseDown = false

    // VR elements
    let controller1 = null
    let controller2 = null
    let isSelecting = false

    // State variables
    const vrMode = ref(false)
    const isWebXRAvailable = ref(false)
    const currentTool = ref(null)
    const selectedEmotion = ref(null)

    // Enhanced emotions data
    const enhancedEmotions = ref([
      {
        name: 'Anger',
        icon: '🔥',
        color: '#ff4757',
        secondaryColor: '#ff6b81',
        intensity: 8,
        density: 0.9,
        sound: 'sharp_crash',
      },
      {
        name: 'Calm',
        icon: '🌊',
        color: '#70a1ff',
        secondaryColor: '#7bed9f',
        intensity: 3,
        density: 0.3,
        sound: 'water_drop',
      },
      {
        name: 'Joy',
        icon: '✨',
        color: '#fffa65',
        secondaryColor: '#ff7f50',
        intensity: 5,
        density: 0.5,
        sound: 'bell_chime',
      },
      {
        name: 'Sadness',
        icon: '🌧️',
        color: '#57606f',
        secondaryColor: '#a4b0be',
        intensity: 7,
        density: 0.7,
        sound: 'distant_thunder',
      },
      {
        name: 'Anxiety',
        icon: '🌀',
        color: '#eccc68',
        secondaryColor: '#ff6348',
        intensity: 6,
        density: 0.6,
        sound: 'wind_howling',
      },
    ])

    // Sculpting tools
    const tools = ref([
      { name: 'Sculpt', icon: 'fas fa-hand-paper', action: 'add' },
      { name: 'Smooth', icon: 'fas fa-brush', action: 'smooth' },
      { name: 'Pinch', icon: 'fas fa-hand-pointer', action: 'pinch' },
      { name: 'Flatten', icon: 'fas fa-vector-square', action: 'flatten' },
      { name: 'Inflate', icon: 'fas fa-expand', action: 'inflate' },
    ])

    // Initialize the scene
    onMounted(() => {
      initScene()
      initSculptingClay()
      setupEventListeners()
      checkWebXRSupport()

      currentTool.value = tools.value[0]
      selectedEmotion.value = enhancedEmotions.value[0]
    })

    onUnmounted(() => {
      // Clean up
      window.removeEventListener('resize', onWindowResize)
      if (renderer.xr.isPresenting) {
        renderer.xr.getSession().end()
      }
    })

    // Check WebXR support
    const checkWebXRSupport = () => {
      if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          isWebXRAvailable.value = supported
          if (!supported) {
            console.warn('WebXR VR not supported, using polyfill')
            new WebXRPolyfill()
          }
        })
      } else {
        console.warn('WebXR not available, using polyfill')
        new WebXRPolyfill()
      }
    }

    // Initialize Three.js scene
    const initScene = () => {
      // Renderer setup
      renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
      renderer.setClearColor(0xf8f9fa)
      renderer.xr.enabled = true
      canvasContainer.value.appendChild(renderer.domElement)

      // Camera position
      camera.position.z = 5

      // Lighting
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(1, 1, 1)
      scene.add(light)

      const ambientLight = new THREE.AmbientLight(0x404040)
      scene.add(ambientLight)

      // Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      // Start animation loop
      renderer.setAnimationLoop(animate)
    }

    // Initialize sculpting clay
    const initSculptingClay = () => {
      const geometry = new THREE.SphereBufferGeometry(1, 64, 64)

      // Create a displacement map for more organic feel
      const displacement = new Float32Array(geometry.attributes.position.count)
      for (let i = 0; i < displacement.length; i++) {
        displacement[i] = Math.random() * 0.1
      }
      geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1))

      const material = new THREE.MeshStandardMaterial({
        color: 0xff4757,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: false,
      })

      clayObject = new THREE.Mesh(geometry, material)
      scene.add(clayObject)
    }

    // Setup VR controllers
    const setupVRControllers = () => {
      controller1 = renderer.xr.getController(0)
      controller1.addEventListener('selectstart', onSelectStart)
      controller1.addEventListener('selectend', onSelectEnd)
      controller1.addEventListener('squeezestart', onSelectStart)
      controller1.addEventListener('squeezeend', onSelectEnd)
      scene.add(controller1)

      controller2 = renderer.xr.getController(1)
      controller2.addEventListener('selectstart', onSelectStart)
      controller2.addEventListener('selectend', onSelectEnd)
      scene.add(controller2)
    }

    // VR controller select start
    const onSelectStart = () => {
      isSelecting = true
      const intersections = getControllerIntersections(controller1)
      if (intersections.length > 0) {
        sculptClay(intersections[0].point, currentTool.value.action)
      }
    }

    // VR controller select end
    const onSelectEnd = () => {
      isSelecting = false
    }

    // Get controller intersections with clay
    const getControllerIntersections = (controller) => {
      const tempMatrix = new THREE.Matrix4()
      tempMatrix.identity().extractRotation(controller.matrixWorld)

      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

      return raycaster.intersectObject(clayObject)
    }

    // Animation loop
    const animate = (timestamp, frame) => {
      if (renderer.xr.isPresenting) {
        // VR mode - use XR frame
        if (isSelecting && controller1) {
          const intersections = getControllerIntersections(controller1)
          if (intersections.length > 0) {
            sculptClay(intersections[0].point, currentTool.value.action)
          }
        }
      } else {
        // Desktop mode - update controls
        controls.update()
      }

      renderer.render(scene, camera)
    }

    // Sculpt clay based on tool
    const sculptClay = (point, action) => {
      const geometry = clayObject.geometry
      const positions = geometry.attributes.position
      const originalPositions = positions.array.slice()
      const tempVector = new THREE.Vector3()

      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3

        tempVector.set(originalPositions[i3], originalPositions[i3 + 1], originalPositions[i3 + 2])

        const distance = tempVector.distanceTo(point)
        if (distance < 0.5) {
          const influence = (0.5 - distance) * 2 * (selectedEmotion.value.intensity / 5)
          const direction = new THREE.Vector3().subVectors(tempVector, point).normalize()

          switch (action) {
            case 'add':
              tempVector.add(direction.multiplyScalar(0.1 * influence))
              break
            case 'smooth':
              tempVector.lerp(point, 0.05 * influence)
              break
            case 'pinch':
              tempVector.add(direction.multiplyScalar(-0.15 * influence))
              break
            case 'flatten':
              tempVector.y = point.y * (1 - influence) + tempVector.y * influence
              break
            case 'inflate':
              tempVector.add(direction.multiplyScalar(-0.2 * influence))
              break
          }

          positions.array[i3] = tempVector.x
          positions.array[i3 + 1] = tempVector.y
          positions.array[i3 + 2] = tempVector.z
        }
      }

      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }

    // Event handlers
    const onMouseDown = (event) => {
      isMouseDown = true
      handleSculpt(event)
    }

    const onMouseMove = (event) => {
      if (!isMouseDown) return
      handleSculpt(event)
    }

    const onMouseUp = () => {
      isMouseDown = false
    }

    const handleSculpt = (event) => {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(clayObject)

      if (intersects.length > 0) {
        sculptClay(intersects[0].point, currentTool.value.action)
      }
    }

    const setupEventListeners = () => {
      window.addEventListener('resize', onWindowResize)
      renderer.domElement.addEventListener('mousedown', onMouseDown)
      renderer.domElement.addEventListener('mousemove', onMouseMove)
      renderer.domElement.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('mouseleave', onMouseUp)
    }

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
    }

    // VR mode toggle
    const toggleVR = async () => {
      if (!renderer.xr.enabled) {
        // Enter VR
        try {
          renderer.xr.enabled = true
          setupVRControllers()

          const sessionInit = { optionalFeatures: ['local-floor', 'hand-tracking'] }
          const session = await navigator.xr.requestSession('immersive-vr', sessionInit)

          await renderer.xr.setSession(session)
          vrMode.value = true
          controls.enabled = false
          camera.position.set(0, 1.6, 3) // Eye level height
        } catch (err) {
          console.error('Error entering VR:', err)
          renderer.xr.enabled = false
          vrMode.value = false
        }
      } else {
        // Exit VR
        const session = renderer.xr.getSession()
        if (session) {
          await session.end()
        }
        renderer.xr.enabled = false
        vrMode.value = false
        controls.enabled = true
        camera.position.set(0, 0, 5)
      }
    }

    // Select emotion
    const selectEmotion = (emotion) => {
      selectedEmotion.value = emotion
      clayObject.material.color.set(emotion.color)

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50])
      }
    }

    // Select tool
    const selectTool = (tool) => {
      currentTool.value = tool
    }

    return {
      canvasContainer,
      vrMode,
      isWebXRAvailable,
      enhancedEmotions,
      tools,
      currentTool,
      selectedEmotion,
      toggleVR,
      selectEmotion,
      selectTool,
    }
  },
}
</script>

<style scoped>
.emotion-sculptor {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.vr-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.vr-toggle button {
  padding: 10px 15px;
  background: linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.vr-toggle button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.vr-toggle button:disabled {
  background: #cccccc;

  cursor: not-allowed;
}

.vr-toggle button:disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.vr-toggle button:disabled:hover .tooltip {
  opacity: 1;
}

.canvas-container {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #a55454 0%, #863434 100%);
  /* background-image: url('../assets/images/sculpture.jpg'); */
}

.controls {
  margin-top: 20px;
}

.emotion-palette {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.emotion-card {
  width: 180px;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.emotion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.emotion-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.emotion-name {
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.emotion-intensity input {
  width: 100%;
}

.tool-palette {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.tool-palette button {
  padding: 12px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.tool-palette button.active {
  background: #6e45e2;
  color: white;
  border-color: #6e45e2;
}

.tool-palette button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.vr-interface {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  flex-direction: column;
}

.vr-notice {
  background: rgba(0, 0, 0, 0.7);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 80%;
}

.vr-notice button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #6e45e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .canvas-container {
    height: 400px;
  }

  .emotion-card {
    width: 150px;
    padding: 10px;
  }

  .tool-palette button {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .emotion-card {
    width: 120px;
  }

  .vr-toggle {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
  }
}
</style>
