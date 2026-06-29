# AtollSIM Vercel Web App

This version runs from Vercel cloud storage at runtime.

- The public website (`index.html`) loads content from `/api/cms`.
- The admin CMS (`admin.html`) saves content to `/api/cms`.
- `/api/cms` stores content in Vercel KV using `@vercel/kv`.

Required Vercel setup:

1. Add Vercel KV storage to the project.
2. Redeploy the project.
3. Open `/admin.html`, log in, edit content, and press `Publish changes`.
