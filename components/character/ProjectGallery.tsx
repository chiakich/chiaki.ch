import React from 'react'
import { Box, Flex, VStack, styled } from 'styled-system/jsx'
import { Switch } from 'components/ui/controls'
import { getAllProjects } from 'components/character/characterAssetsIndex'
import ProjectCard from './ProjectCard'

const Text = styled.p
const FormLabel = styled.label

interface ProjectGalleryProps {
  showR18: boolean
  ageConfirmed: boolean
  onR18Toggle: () => void
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  showR18,
  ageConfirmed,
  onR18Toggle,
}) => {
  const projects = getAllProjects()

  return (
    <Box maxWidth="800px" width="100%" margin="0 auto">
      {/* R18 Toggle */}
      <Box marginBottom={6}>
        <Flex alignItems="center" justifyContent="center">
          <FormLabel
            htmlFor="r18-toggle"
            margin={0}
            marginRight={3}
            color="white"
            fontSize="sm"
          >
            顯示 R18 內容
          </FormLabel>
          <Switch
            id="r18-toggle"
            isChecked={showR18}
            onChange={onR18Toggle}
            colorScheme="red"
            size="md"
          />
        </Flex>
        {showR18 && (
          <Text
            fontSize="xs"
            color="red.300"
            textAlign="center"
            marginTop={2}
            opacity={0.8}
          >
            ⚠️ 已開啟成人內容顯示
          </Text>
        )}
      </Box>

      {/* Projects List - Natural scrolling */}
      <VStack gap={6} alignItems="stretch">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            showR18={showR18}
            ageConfirmed={ageConfirmed}
          />
        ))}
      </VStack>
    </Box>
  )
}

export default ProjectGallery
