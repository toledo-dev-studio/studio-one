# Mockable API payloads

This folder holds the static JSON payloads used when the application runs in
**mockable** mode (`VITE_ENVIRONMENT=mockable`).

In mockable mode the API functions under `src/**/api/*.api.ts` read the JSON
files from this folder instead of calling the real backend, so the frontend can
be developed and demoed without any service running. The files are served as
static assets by the Vite dev server and by nginx in the production image.

Example:

```
public/api/auth/me.json
```

```ts
export const meAsync = async (): Promise<AuthUserResponse> => {
  if (IS_MOCKABLE) {
    const { data } = await api.get<AuthUserResponse>('/auth/me.json')
    return data
  }

  const { data } = await api.get<AuthUserResponse>('/auth/me')
  return data
}
```

> Note: authentication is handled by Firebase, so it is never mocked here.
> The mockable payloads belong to the Studio One API (compositions and future
> modules).
