import gravatar from 'gravatar';

export const generateAvatarFromEmail = (email) => {
return gravatar.url(email, {
  protocol: 'https',
  s: '100',
  r: 'pg',
  d: 'retro',
});
}