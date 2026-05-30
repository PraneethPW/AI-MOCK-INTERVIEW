import { Float, MeshDistortMaterial, OrbitControls, Sphere, Torus } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

function NeuralCore() {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.2}>
        <Sphere args={[1.25, 64, 64]} position={[0, 0.12, 0]}>
          <MeshDistortMaterial color="#4cc9f0" distort={0.28} speed={1.8} roughness={0.24} metalness={0.62} />
        </Sphere>
      </Float>
      <Torus args={[1.86, 0.035, 16, 120]} rotation={[1.18, 0.25, 0.4]}>
        <meshStandardMaterial color="#2ee9a6" emissive="#2ee9a6" emissiveIntensity={0.45} />
      </Torus>
      <Torus args={[2.2, 0.025, 16, 120]} rotation={[0.1, 1.32, 1.2]}>
        <meshStandardMaterial color="#ff7a6b" emissive="#ff7a6b" emissiveIntensity={0.34} />
      </Torus>
      <Torus args={[2.55, 0.02, 16, 120]} rotation={[1.7, 0.4, -0.5]}>
        <meshStandardMaterial color="#ffc857" emissive="#ffc857" emissiveIntensity={0.28} />
      </Torus>
    </group>
  )
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[3, 3, 5]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-4, -2, -2]} intensity={1.8} color="#2ee9a6" />
      <NeuralCore />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  )
}
