import type { NextPage } from 'next'
import { Box, Flex, styled } from 'styled-system/jsx'
import { LetterpressStyles } from 'kappan/react'
import { useI18n } from 'i18n'
import PostCard, { PostCardData } from 'components/blog/PostCard'
import posts from 'content/blog/index.json'
import { makeStaticProps } from 'i18n/messages'
import { BLOG_OPTIONS, SHEET_CLASS, blogLetterpressCss } from 'components/blog/letterpress'

const Heading = styled.h1
const Text = styled.p

const allPosts = posts as unknown as PostCardData[]

const Blog: NextPage = () => {
  const { t } = useI18n()

  return (
    <Box className={SHEET_CLASS} minHeight="100vh" overflowX="clip" position="relative">
      <LetterpressStyles {...BLOG_OPTIONS} />
      <style dangerouslySetInnerHTML={{ __html: blogLetterpressCss }} />

      <Flex
        pt="96px"
        pb="80px"
        minHeight="100vh"
        maxW="900px"
        mx="auto"
        px={{ base: '24px', md: '40px' }}
        direction="column"
        position="relative"
        zIndex={1}
      >
        <Box textAlign="center" mb={{ base: 10, md: 14 }}>
          <Text className="lbl">{t('blogPage.eyebrow')}</Text>
          <Heading
            mt={3}
            style={{ fontFamily: 'var(--type)', fontSize: 'clamp(30px, 6vw, 46px)', fontWeight: 700 }}
          >
            目次
          </Heading>
          <Text className="lbl" mt={4}>{allPosts.length} ENTRIES</Text>
          <Box mx="auto" mt={6} style={{ width: 46, borderTop: '1px solid var(--ink)' }} />
        </Box>

        <Box style={{ borderBottom: '1px solid color-mix(in srgb, var(--ink) 20%, transparent)' }}>
          {allPosts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </Box>

        {/* .lbl 走 --latin，沒有漢字。 */}
        <Text
          textAlign="center"
          mt={12}
          style={{ fontFamily: 'var(--type)', fontSize: '8pt', letterSpacing: '.3em', color: 'var(--red)' }}
        >
          千秋稻荷社印書館　常世町一丁目
        </Text>
      </Flex>
    </Box>
  )
}

export default Blog

export const getStaticProps = makeStaticProps('blog')
