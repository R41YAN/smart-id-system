// University Logos registry & utility helper

export function getUniversityLogo(universityName, customLogoUrl) {
  if (customLogoUrl && typeof customLogoUrl === 'string' && customLogoUrl.trim() !== '') {
    // If it was stored as .png for built-ins, normalize to .svg
    return customLogoUrl.replace(/\.png$/, '.svg');
  }

  if (!universityName) return null;

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

  // Returns null when no logo exists so UI renders the blue bank icon (NEVER the SIFS logo)
  return null;
}
