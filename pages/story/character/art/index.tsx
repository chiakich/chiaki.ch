import type { NextPage } from 'next'
import { Box } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import ProjectGallery from 'components/character/ProjectGallery'
import { useState, useEffect } from 'react'
import { useI18n } from 'i18n'

const CharacterArtPage: NextPage = () => {
  const { t } = useI18n()
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
        `${t('characterPage.r18Description')}\n\n${t('characterPage.r18Question')}`
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

      <Box
        paddingTop="128px" // Account for fixed TopBar and SubNav
        paddingX={{ base: '20px', md: '40px', lg: '60px' }}
        paddingBottom="40px"
      >
        <Box
          as="h1"
          color="white"
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="bold"
          textAlign="center"
          mb={8}
        >
          {t('meta.art.title')}
        </Box>
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
