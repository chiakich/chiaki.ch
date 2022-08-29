import { useRef } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Image from 'next-image-export-optimizer'
import { useParallax } from 'utils/hooks'
import ChiakiImg from '@img/shone.png'

const BlackoutText = ({
  progress,
  children,
}: {
  progress: MotionValue<string>
  children: React.ReactNode
}) => (
  <Box position="relative" width="fit-content" my="10px">
    <motion.div
      style={{
        backgroundColor: 'black',
        position: 'absolute',
        right: 0,
        height: '100%',
        width: progress,
      }}
    />
    {children}
  </Box>
)

const Detail = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const y = useParallax(scrollYProgress, 200)
  const wrapperY = useTransform(scrollYProgress, [0, 0.6, 1], ['100%', '100%', '0%'])

  return (
    <Box height="200vh" width="100%" ref={ref}>
      <Box
        position="sticky"
        top="0"
        backgroundColor="white"
        height="100vh"
        overflow="hidden"
      >
        <Box
          height="100%"
          maxWidth="900px"
          marginX={{ base: '10px', md: '100px', lg: 'auto' }}
        >
          <Flex height="100%" width="100%" alignItems="center" position="absolute">
            <Box
              width="calc(100vw - 20px)"
              maxWidth="400px"
              zIndex="10"
              my="50px"
              backgroundColor="rgba(255,255,255,0.7)"
              alignSelf={{ base: 'flex-start', sm: 'center' }}
            >
              <BlackoutText progress={wrapperY}>
                <Box fontWeight="600" fontSize="40px">
                  千秋のご挨拶
                </Box>
              </BlackoutText>
              <BlackoutText progress={wrapperY}>
                本神社之祭奉神明──稻荷大神，被尊崇為「掌管衣食住的根基，庇佑所有人生活富饒快樂的神明」。
              </BlackoutText>
              <BlackoutText progress={wrapperY}>
                做為3萬稻荷神社之一，本社受理祈願五穀豐登、商業興盛、家庭安全、實現諸願望等各式委託，於網路的世界為大家服務。
              </BlackoutText>
              <BlackoutText progress={wrapperY}>
                為了達成帶給大家快樂的目標，本社目前正在嘗試偶像活動，敬請多加支持！
              </BlackoutText>
            </Box>
          </Flex>

          <Box
            width="700px"
            float="right"
            marginRight={{
              base: '-250px',
              sm: '-200px',
              lg: '-100px',
            }}
          >
            <motion.div style={{ y }}>
              <Image
                src={ChiakiImg.src}
                alt="Chiaki"
                width="1240px"
                height="2000px"
              />
            </motion.div>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Detail
