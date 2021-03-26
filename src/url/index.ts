export function getUrlPrefix() {
  if (typeof window === 'undefined') {
    return '';
  }

  const { location } = window;
  const port = location.port ? `:${location.port}` : '';
  const full = `${location.protocol}//${location.hostname}${port}`;
  return full;
}
