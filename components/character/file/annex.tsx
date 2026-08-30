import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ViewportLabel } from './parts'
import { styled } from 'styled-system/jsx'

const Img = styled.img

const Live2DModelClient = dynamic(() => import('../Live2DModelClient'), {
  ssr: false,
  loading: () => <ViewportLabel title="LIVE2D VIEWPORT" state="LOADING" />,
})

export const Live2DAnnex = ({ width, height }: { width: number; height: number }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return mounted ? (
    <Live2DModelClient width={width} height={height} />
  ) : (
    <ViewportLabel title="LIVE2D VIEWPORT" state="CURSOR TRACKING : ON" />
  )
}

export const MinecraftAnnex = ({ size }: { size: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let viewer: { dispose?: () => void } | null = null
    let cancelled = false

    import('skinview3d')
      .then((skinview3d) => {
        if (cancelled) return
        const instance = new skinview3d.SkinViewer({ canvas, width: size, height: size })
        instance.loadSkin('/assets/story/character/minecraft-skin.png')
        instance.controls.enableRotate = true
        instance.controls.enableZoom = false
        instance.controls.enablePan = false
        instance.animation = new skinview3d.WalkingAnimation()
        viewer = instance
      })
      .catch((error) => {
        console.error('Failed to load skinview3d:', error)
      })

    return () => {
      cancelled = true
      viewer?.dispose?.()
    }
  }, [size])

  return <canvas ref={canvasRef} width={size} height={size} />
}

export const SkinTexture = ({ size }: { size: number }) => (
  <Img
    src="/assets/story/character/minecraft-skin.png"
    alt=""
    width={size}
    height={size}
    style={{ display: 'block', width: size, height: size, imageRendering: 'pixelated' }} />
)
