/**
 * PetZoe Animal Image Resolver
 * Provides reliable, locally hosted fallback imagery for shelter & adoption animals,
 * preventing broken images when external image links expire or 404.
 */

export const ANIMAL_IMAGE_REGISTRY = {
  // Milo (Dachshund Indie Cross) - SH-GA-002
  MILO: '/images/animals/milo-dachshund.jpg',
  // Rocky (German Shepherd Mix) - SH-CPF-001
  ROCKY: '/images/animals/rocky-germanshepherd.jpg',
  // Daisy (Poodle Indie Cross) - SH-SAW-002
  DAISY: '/images/animals/daisy-poodle.jpg',
  // Generic fallbacks
  DEFAULT_DOG: '/images/animals/milo-dachshund.jpg',
  DEFAULT_CAT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
};

// Known broken external Unsplash IDs mapped to working local images
const BROKEN_URL_MAP = {
  '1521673461164': ANIMAL_IMAGE_REGISTRY.MILO,
  '1589941013453': ANIMAL_IMAGE_REGISTRY.ROCKY,
  '1591769225440': ANIMAL_IMAGE_REGISTRY.DAISY
};

/**
 * Resolves the animal image, prioritizing working local assets over broken links.
 */
export function getAnimalImageUrl(animal) {
  if (!animal) return ANIMAL_IMAGE_REGISTRY.DEFAULT_DOG;

  const rawUrl = animal.primaryPhotoBase64 || animal.photoUrl || animal.imageUrl || '';
  const code = (animal.animalCode || '').toUpperCase();
  const name = (animal.name || '').toLowerCase().trim();

  // 1. Direct match by animal code or known broken URL
  if (code === 'SH-GA-002' || name === 'milo' || rawUrl.includes('1521673461164')) {
    return ANIMAL_IMAGE_REGISTRY.MILO;
  }

  if (code === 'SH-CPF-001' || (name === 'rocky' && (animal.species || '').toLowerCase() === 'dog') || rawUrl.includes('1589941013453')) {
    return ANIMAL_IMAGE_REGISTRY.ROCKY;
  }

  if (code === 'SH-SAW-002' || name === 'daisy' || rawUrl.includes('1591769225440')) {
    return ANIMAL_IMAGE_REGISTRY.DAISY;
  }

  // 2. Check if the URL contains any other broken id
  for (const [brokenId, replacement] of Object.entries(BROKEN_URL_MAP)) {
    if (rawUrl.includes(brokenId)) {
      return replacement;
    }
  }

  // 3. Return raw URL if available
  if (rawUrl && rawUrl.trim() !== '') {
    return rawUrl;
  }

  // 4. Default fallback by species
  if ((animal.species || '').toLowerCase() === 'cat') {
    return ANIMAL_IMAGE_REGISTRY.DEFAULT_CAT;
  }

  return ANIMAL_IMAGE_REGISTRY.DEFAULT_DOG;
}

/**
 * Image onError handler to seamlessly recover from network or 404 failures.
 */
export function handleAnimalImageError(e, animal) {
  const currentSrc = e.currentTarget.src;
  const resolved = getAnimalImageUrl(animal);
  
  // If the image was trying to load the broken link, swap to resolved local asset
  if (currentSrc !== resolved && !currentSrc.includes('milo-dachshund.jpg')) {
    e.currentTarget.src = resolved;
  } else {
    // Ultimate fallback
    e.currentTarget.src = ANIMAL_IMAGE_REGISTRY.MILO;
  }
}
