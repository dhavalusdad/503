export const redirectTo = (url: string, otherParams?: { isNewTab: boolean }) => {
  if (otherParams?.isNewTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
};
