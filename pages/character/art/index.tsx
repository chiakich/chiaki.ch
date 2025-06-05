import type { NextPage } from 'next'
import { Box } from '@chakra-ui/react'
import TopBar from 'components/TopBar'
import CharacterSubNav from 'components/character/CharacterSubNav'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import ProjectGallery from 'components/character/ProjectGallery'
import { useState, useEffect } from 'react'

const CharacterArtPage: NextPage = () => {
  const [showR18, setShowR18] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  // Check if user has previously confirmed age
  useEffect(() => {
    const confirmed = localStorage.getItem('ageConfirmed')
    if (confirmed === 'true') {
      setAgeConfirmed(true)
    }
  }, [])

  const handleR18Toggle = () => {
    if (!ageConfirmed) {
      // Show age confirmation dialog
      const confirmed = window.confirm(
        '此內容包含成人內容，僅限18歲以上觀看。\n\n您是否已滿18歲？'
      )
      if (confirmed) {
        setAgeConfirmed(true)
        localStorage.setItem('ageConfirmed', 'true')
        setShowR18(!showR18)
      }
    } else {
      setShowR18(!showR18)
    }
  }

  return (
    <Box backgroundColor="black" width="100%" minHeight="100vh">
      <TopBar />
      <CharacterSubNav />

      <Box
        paddingTop="128px" // Account for fixed TopBar and SubNav
        paddingX={{ base: '20px', md: '40px', lg: '60px' }}
        paddingBottom="40px"
      >
        <ProjectGallery
          showR18={showR18}
          ageConfirmed={ageConfirmed}
          onR18Toggle={handleR18Toggle}
        />
      </Box>
    </Box>
  )
}

export default CharacterArtPage
