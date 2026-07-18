const CANONICAL_HOSTNAME = "dansiegel.net";
const WWW_HOSTNAME = `www.${CANONICAL_HOSTNAME}`;

export const onRequest: PagesFunction = ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === WWW_HOSTNAME) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOSTNAME;
    url.port = "";
    return Response.redirect(url.toString(), 308);
  }

  return next();
};
