import { Box } from '@chakra-ui/react'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

const SeedGrowthSection = () => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const seedRef = useRef<HTMLDivElement>(null!)
  const groundRef = useRef<HTMLDivElement>(null!)
  const stemRef = useRef<HTMLDivElement>(null!)
  const leftLeafRef = useRef<HTMLDivElement>(null!)
  const rightLeafRef = useRef<HTMLDivElement>(null!)
  const sparklesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    const seed = seedRef.current
    const ground = groundRef.current
    const stem = stemRef.current
    const leftLeaf = leftLeafRef.current
    const rightLeaf = rightLeafRef.current
    const sparkles = sparklesRef.current.filter(Boolean)

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        // markers: true, // Enable for debugging
      },
    })

    // Initial states
    gsap.set(seed, {
      opacity: 0,
      scale: 1,
      x: '-50%',
      y: '-50%',
    })
    gsap.set(ground, {
      y: '100vh',
      x: '0',
    })
    gsap.set(stem, {
      height: 0,
      x: '-50%',
    })
    gsap.set([leftLeaf, rightLeaf], {
      scale: 0,
      rotation: 0,
    })
    gsap.set(sparkles, {
      opacity: 0,
      scale: 0,
    })

    // Animation sequence
    tl
      // Phase 1: Seed appears (0-15%)
      .to(
        seed,
        {
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out',
        },
        0
      )

      // Phase 2: Ground line appears and moves to center (20-40%)
      .to(
        ground,
        {
          y: '0vh',
          duration: 0.2,
          ease: 'power2.inOut',
        },
        0.2
      )

      // Phase 3: Seed sinks into ground (40-60%)
      .to(
        seed,
        {
          y: '10%',
          scale: 0.8,
          duration: 0.1,
          ease: 'power2.in',
        },
        0.4
      )
      .to(
        seed,
        {
          opacity: 0,
          duration: 0.1,
          ease: 'power2.in',
        },
        0.5
      )

      // Phase 4: Stem grows (70-85%)
      .to(
        stem,
        {
          height: '60px',
          duration: 0.15,
          ease: 'power2.out',
        },
        0.7
      )

      // Phase 6: Leaves appear (85-97%)
      .to(
        leftLeaf,
        {
          scale: 1,
          rotation: 25,
          duration: 0.06,
          ease: 'back.out(1.7)',
        },
        0.85
      )
      .to(
        rightLeaf,
        {
          scale: 1,
          rotation: -25,
          duration: 0.06,
          ease: 'back.out(1.7)',
        },
        0.87
      )

      // Phase 7: Sparkles (80-100%)
      .to(
        sparkles,
        {
          opacity: 1,
          scale: 1.5,
          duration: 0.1,
          stagger: 0.02,
          ease: 'power2.out',
        },
        0.8
      )
      .to(
        sparkles,
        {
          opacity: 0,
          scale: 0,
          duration: 0.1,
          stagger: 0.02,
          ease: 'power2.in',
        },
        0.9
      )

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])
  return (
    <>
      <Box
        ref={containerRef}
        height="200vh"
        width="100%"
        position="relative"
        background="linear-gradient(to bottom,rgb(0, 0, 0) 0%,rgb(130, 186, 255) 100%)"
        overflow="hidden"
        zIndex="0"
      >
        {/* Ground line */}
        <Box
          ref={groundRef}
          position="fixed"
          top="50vh"
          left="0"
          right="0"
          height="2px"
          backgroundColor="white"
          zIndex="6"
        />

        {/* Container for animation elements */}
        <Box
          position="sticky"
          top="0"
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Seed */}
          <Box ref={seedRef} position="fixed" top="50vh" left="50%" zIndex="10">
            <Box
              width="20px"
              height="25px"
              border="2px solid white"
              borderRadius="50% 50% 50% 50% / 60% 60% 40% 40%"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '12px',
                border: '1px solid white',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              }}
            />
          </Box>

          {/* Plant stem */}
          <Box
            ref={stemRef}
            position="fixed"
            bottom="50vh"
            left="50%"
            width="2px"
            backgroundColor="white"
            zIndex="8"
          />

          {/* Left leaf */}
          <Box
            ref={leftLeafRef}
            position="fixed"
            bottom="calc(50vh + 55px)"
            left="calc(50% - 32px)"
            transformOrigin="bottom right"
            zIndex="9"
          >
            <Box
              width="30px"
              height="12px"
              border="2px solid white"
              borderRadius="50%"
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '15%',
                right: '15%',
                height: '1px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
          </Box>

          {/* Right leaf */}
          <Box
            ref={rightLeafRef}
            position="fixed"
            bottom="calc(50vh + 55px)"
            right="calc(50% - 32px)"
            transformOrigin="bottom left"
            zIndex="9"
          >
            <Box
              width="30px"
              height="12px"
              border="2px solid white"
              borderRadius="50%"
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '15%',
                right: '15%',
                height: '1px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
          </Box>

          {/* Sparkle effects */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              ref={(el) => {
                if (el) sparklesRef.current[i] = el
              }}
              position="fixed"
              bottom={`calc(50vh + ${25 + Math.random() * 55}px)`}
              left={`calc(50% + ${(Math.random() - 0.5) * 70}px)`}
              width="4px"
              height="4px"
              backgroundColor="white"
              borderRadius="50%"
            />
          ))}
        </Box>
      </Box>
      <Box height="100vh" width="100vw" backgroundColor="rgb(130, 186, 255)" />
    </>
  )
}

export default SeedGrowthSection
