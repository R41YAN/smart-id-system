// University Logos registry & utility helper
export const DEFAULT_UNIVERSITY_LOGOS = [
  { name: 'University of Information Technology and Sciences', short: 'UITS', logo: '/logos/uits.svg' },
  { name: 'Dhaka University', short: 'DU', logo: '/logos/du.svg' },
  { name: 'BRAC University', short: 'BRAC', logo: '/logos/brac.svg' },
  { name: 'Metropolitan University', short: 'MU', logo: '/logos/mu.svg' },
  { name: 'North South University', short: 'NSU', logo: '/logos/nsu.svg' },
];

export function getUniversityLogo(universityName, customLogoUrl) {
  if (customLogoUrl && customLogoUrl.trim() !== '') {
    // If it was stored as .png, normalize to .svg if matching our built-ins
    return customLogoUrl.replace(/\.png$/, '.svg');
  }

  if (!universityName) return '/logo.jpg';

  const nameUpper = universityName.toUpperCase();
  if (nameUpper.includes('INFORMATION TECHNOLOGY') || nameUpper.includes('UITS')) {
    return '/logos/uits.svg';
  }
  if (nameUpper.includes('DHAKA')) {
    return '/logos/du.svg';
  }
  if (nameUpper.includes('BRAC')) {
    return '/logos/brac.svg';
  }
  if (nameUpper.includes('METROPOLITAN')) {
    return '/logos/mu.svg';
  }
  if (nameUpper.includes('NORTH SOUTH') || nameUpper.includes('NSU')) {
    return '/logos/nsu.svg';
  }

  return '/logo.jpg';
}
