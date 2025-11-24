import { ReactNode, useEffect, useState } from 'react'

import { z } from 'zod'

// outside of App component function (since this doesn't need to be re-created all the time)
const rawDataBlogPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
})

const expectedResponseDataSchema = z.array(rawDataBlogPostSchema)

import BlogPosts, { BlogPost } from './components/BlogPosts.tsx'
import { get } from './util/http.ts'
import fetchingImage from './assets/data-fetching.png'
import ErrorMessage from './components/ErrorMessage.tsx'

type RawDataBlogPost = {
  id: number
  userId: number
  title: string
  body: string
}

function App() {
  const [fetchedPosts, setFetchedPosts] = useState<BlogPost[]>()
  const [error, setError] = useState<string>()
  const [isFetching, setIsFetching] = useState<boolean>(false)

  useEffect(() => {
    async function fetchPosts() {
      setIsFetching(true)
      try {
        const data = await get(
          'https://jsonplaceholder.typicode.com/posts',
          z.array(rawDataBlogPostSchema)
        )

        const parsedData = expectedResponseDataSchema.parse(data)
        // No more type casting via "as" needed!
        // Instead, here, TypeScript "knows" that parsedData will be an array
        // full with objects as defined by the above schema
        const blogPosts: BlogPost[] = parsedData.map((rawPost) => {
          return {
            id: rawPost.id,
            title: rawPost.title,
            text: rawPost.body,
          }
        })
        setFetchedPosts(blogPosts)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
        // setError('Failed to fetch posts!');
      }

      setIsFetching(false)
    }

    fetchPosts()
  }, [])

  let content: ReactNode

  if (error) {
    content = <ErrorMessage text={error} />
  }

  if (fetchedPosts) {
    content = <BlogPosts posts={fetchedPosts} />
  }

  if (isFetching) {
    content = <p id="loading-fallback">Fetching posts...</p>
  }

  return (
    <main>
      <img
        src={fetchingImage}
        alt="An abstract image depicting a data fetching process"
      />
      {content}
    </main>
  )
}

export default App
