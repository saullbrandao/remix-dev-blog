import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'
import { createPost, getPost } from '~/post'

type PostError = {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.edit, 'expected params.slug')

  const post = await getPost(params.edit)
  return post
}

export const action: ActionFunction = async ({ request }) => {
  await new Promise(res => setTimeout(res, 1000))
  const formData = await request.formData()

  const title = formData.get('title')
  const slug = formData.get('slug')
  const markdown = formData.get('markdown')

  const errors: PostError = {}
  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true

  if (Object.keys(errors).length) {
    return errors
  }

  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')

  await createPost({ title, slug, markdown })

  return redirect('/admin')
}

export default function EditPost() {
  const errors = useActionData()
  const transition = useTransition()
  const post = useLoaderData()

  return (
    <Form key={post.slug} method="post">
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{' '}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea name="markdown" rows={20} defaultValue={post.body} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Saving...' : 'Save edits'}
        </button>
      </p>
    </Form>
  )
}
