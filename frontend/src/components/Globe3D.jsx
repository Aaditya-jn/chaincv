import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function NetworkGlobe({ mousePos }) {
  const groupRef = useRef()
  const nodesRef = useRef()
  const linesRef = useRef()

  const { nodePositions, linePositions, nodeColors } = useMemo(() => {
    const count = 120
    const positions = []
    const colors = []
    const radius = 2.8

    // Generate points on sphere using fibonacci spiral
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = ((1 + Math.sqrt(5)) / 2) * i * Math.PI * 2
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      positions.push(x * radius, y * radius, z * radius)
      // Mix of green and dim white
      const isGreen = Math.random() > 0.4
      colors.push(
        isGreen ? 0 : 0.5,
        isGreen ? 1 : 0.5,
        isGreen ? 0.58 : 0.5
      )
    }

    // Create connecting lines between nearby nodes
    const lines = []
    const threshold = 1.4
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < threshold) {
          lines.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          )
        }
      }
    }

    return {
      nodePositions: new Float32Array(positions),
      linePositions: new Float32Array(lines),
      nodeColors: new Float32Array(colors),
    }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Slow auto-rotation
    groupRef.current.rotation.y = t * 0.08
    groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.1

    // Parallax from mouse
    if (mousePos.current) {
      const targetX = mousePos.current.y * 0.15
      const targetY = mousePos.current.x * 0.15
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2.8, 24, 24]} />
        <meshBasicMaterial color="#00FF94" wireframe opacity={0.06} transparent />
      </mesh>

      {/* Nodes */}
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodePositions.length / 3}
            array={nodePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nodeColors.length / 3}
            array={nodeColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>

      {/* Connecting lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00FF94" transparent opacity={0.08} />
      </lineSegments>
    </group>
  )
}

export default function Globe3D({ mousePos }) {
  return (
    <div className="globe-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <NetworkGlobe mousePos={mousePos} />
      </Canvas>
    </div>
  )
}
