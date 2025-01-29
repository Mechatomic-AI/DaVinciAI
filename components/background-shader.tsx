import { Warp } from '@paper-design/shaders-react'

export function BackgroundShader() {
  return (
    <div className="fixed inset-0 -z-10">
      <Warp
        style={{
          width: '100%',
          height: '100%'
        }}
        color1="#0x7DFFEE" 
        color3='#18181B'
        speed={0.2}
        proportion={0.74}
        scale={0.28}
        distortion={0.85}
        swirl={0.90}
        swirlIterations={10}
      />
    </div>
  )
}