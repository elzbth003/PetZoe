/**
 * PetZoe Product Image Analyzer & Resolver
 * Analyzes product names, categories, and attributes to ensure accurate,
 * high-resolution, context-matching images across the marketplace.
 */

// Curated, verified high-resolution pet product imagery
export const PRODUCT_IMAGE_REGISTRY = {
  // Travel & Carriers
  TRAVEL_CRATE: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=600',
  LEATHER_COLLAR: 'https://images.unsplash.com/photo-1682785821382-0fd8d0d3fc0b?auto=format&fit=crop&q=80&w=600',
  DOG_HARNESS: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&q=80&w=600',

  // Dog Food & Nutrition
  DOG_FOOD_KIBBLE: 'https://images.unsplash.com/photo-1747577672101-542f7797048b?auto=format&fit=crop&q=80&w=600',
  PUPPY_FOOD: 'https://images.unsplash.com/photo-1709810024789-4519a14f05ae?auto=format&fit=crop&q=80&w=600',

  // Cat Food & Nutrition
  CAT_FOOD_TUNA: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600',
  CAT_FOOD_KIBBLE: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
  CAT_FOOD_HERRING: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600',

  // Treats & Chews
  BEEF_LIVER_TREATS: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=600',
  DENTAL_CHEW_BONE: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=600',
  SALMON_DENTAL_CHEWS: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&q=80&w=600',
  OMEGA_SOFT_CHEWS: 'https://images.unsplash.com/photo-1709810024789-4519a14f05ae?auto=format&fit=crop&q=80&w=600',

  // Toys
  KONG_CHEW_TOY: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&q=80&w=600',
  FEATHER_WAND_TEASER: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=600',
  ROPE_TUG_TOY: 'https://images.unsplash.com/photo-1561038592-cb5ddedd8377?auto=format&fit=crop&q=80&w=600',
  INTERACTIVE_LASER: 'https://images.unsplash.com/photo-1781497181951-1e2cad205acf?auto=format&fit=crop&q=80&w=600',
  PUZZLE_TOY: 'https://images.unsplash.com/photo-1615486364134-62a4c72c822d?auto=format&fit=crop&q=80&w=600',

  // Grooming & Hygiene
  HIMALAYA_ERINA_SHAMPOO: '/images/products/himalaya-erina-ep-shampoo.png',
  DOG_SHAMPOO: '/images/products/himalaya-erina-ep-shampoo.png',
  DESHEDDING_BRUSH: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
  NAIL_CLIPPER: 'https://images.unsplash.com/photo-1559818469-a289200df0b1?auto=format&fit=crop&q=80&w=600',
  PET_LAVENDER_WIPES: '/images/products/pet-lavender-grooming-wipes.png',
  GROOMING_WIPES: '/images/products/pet-lavender-grooming-wipes.png',

  // Health, Supplements & Medical
  DENTAL_TOOTHPASTE_KIT: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=600',
  NUTRITIONAL_ENERGY_GEL: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
  FIRST_AID_KIT: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&q=80&w=600',
  TICK_FLEA_TREATMENT: 'https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?auto=format&fit=crop&q=80&w=600',
  VITAMIN_SUPPLEMENT: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',

  // Beds & Furniture
  DONUT_PET_BED: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=600',
  ORTHOPEDIC_BED: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600',
  CAT_TREE_CONDO: 'https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&q=80&w=600',

  // General Defaults
  DOG_DEFAULT: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
  CAT_DEFAULT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
  GENERAL_DEFAULT: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'
};

/**
 * Analyzes the product name, category, and keywords to select the most
 * accurate, high-fidelity matching image.
 */
export function analyzeProductNameAndGetImage(productOrName, categoryName = '', petType = '') {
  let name = '';
  let category = categoryName || '';
  let pet = petType || '';

  if (typeof productOrName === 'string') {
    name = productOrName;
  } else if (productOrName && typeof productOrName === 'object') {
    name = productOrName.name || '';
    category = productOrName.categoryName || productOrName.category?.name || category;
    pet = productOrName.petType || pet;
  }

  const text = `${name} ${category} ${pet}`.toLowerCase();

  // 1. Travel & Carriers
  if (text.includes('crate') || text.includes('carrier') || text.includes('travel crate') || text.includes('travel box') || text.includes('kennel')) {
    return PRODUCT_IMAGE_REGISTRY.TRAVEL_CRATE;
  }
  if (text.includes('collar') || text.includes('leather collar')) {
    return PRODUCT_IMAGE_REGISTRY.LEATHER_COLLAR;
  }
  if (text.includes('harness') || text.includes('vest') || text.includes('tactical harness')) {
    return PRODUCT_IMAGE_REGISTRY.DOG_HARNESS;
  }

  // 2. Dog Food
  if (text.includes('puppy') && (text.includes('food') || text.includes('pedigree') || text.includes('chicken & milk') || text.includes('kibble'))) {
    return PRODUCT_IMAGE_REGISTRY.PUPPY_FOOD;
  }
  if (text.includes('royal canin') || (text.includes('dog food') || text.includes('wild prairie') || text.includes('acana') || (text.includes('dog') && text.includes('kibble')))) {
    return PRODUCT_IMAGE_REGISTRY.DOG_FOOD_KIBBLE;
  }

  // 3. Cat Food
  if (text.includes('whiskas') || (text.includes('cat') && (text.includes('tuna') || text.includes('salmon cat')))) {
    return PRODUCT_IMAGE_REGISTRY.CAT_FOOD_TUNA;
  }
  if (text.includes('drools') && (text.includes('cat') || text.includes('fish & chicken'))) {
    return PRODUCT_IMAGE_REGISTRY.CAT_FOOD_KIBBLE;
  }
  if (text.includes('farmina') || text.includes('ocean herring') || (text.includes('cat food') && text.includes('grain-free'))) {
    return PRODUCT_IMAGE_REGISTRY.CAT_FOOD_HERRING;
  }

  // 4. Chews & Treats
  if (text.includes('beef liver') || text.includes('purebites') || text.includes('freeze-dried raw')) {
    return PRODUCT_IMAGE_REGISTRY.BEEF_LIVER_TREATS;
  }
  if (text.includes('spearmint') || text.includes('chlorophyll') || (text.includes('dental chew') && text.includes('bone'))) {
    return PRODUCT_IMAGE_REGISTRY.DENTAL_CHEW_BONE;
  }
  if (text.includes('salmon dental chew') || (text.includes('salmon') && text.includes('dental'))) {
    return PRODUCT_IMAGE_REGISTRY.SALMON_DENTAL_CHEWS;
  }
  if (text.includes('omega chew') || text.includes('omega-3') || text.includes('soft chew')) {
    return PRODUCT_IMAGE_REGISTRY.OMEGA_SOFT_CHEWS;
  }

  // 5. Toys
  if (text.includes('kong') || (text.includes('chew toy') && text.includes('rubber'))) {
    return PRODUCT_IMAGE_REGISTRY.KONG_CHEW_TOY;
  }
  if (text.includes('feather') || text.includes('wand') || text.includes('teaser')) {
    return PRODUCT_IMAGE_REGISTRY.FEATHER_WAND_TEASER;
  }
  if (text.includes('rope') || text.includes('tug') || text.includes('triple-knot')) {
    return PRODUCT_IMAGE_REGISTRY.ROPE_TUG_TOY;
  }
  if (text.includes('laser') || text.includes('laser ball') || text.includes('rolling ball') || text.includes('laser toy')) {
    return PRODUCT_IMAGE_REGISTRY.INTERACTIVE_LASER;
  }
  if (text.includes('squirrel') || text.includes('hide-a-squirrel') || text.includes('puzzle')) {
    return PRODUCT_IMAGE_REGISTRY.PUZZLE_TOY;
  }

  // 6. Grooming & Hygiene
  if (text.includes('shampoo') || text.includes('erina') || text.includes('himalaya') || text.includes('wash') || text.includes('burt\'s bees')) {
    return PRODUCT_IMAGE_REGISTRY.HIMALAYA_ERINA_SHAMPOO;
  }
  if (text.includes('furminator') || text.includes('deshedding') || text.includes('brush') || text.includes('comb')) {
    return PRODUCT_IMAGE_REGISTRY.DESHEDDING_BRUSH;
  }
  if (text.includes('nail clipper') || text.includes('nail') || text.includes('claw clipper')) {
    return PRODUCT_IMAGE_REGISTRY.NAIL_CLIPPER;
  }
  if (text.includes('wipe') || text.includes('dental wipes') || text.includes('grooming wipes') || text.includes('petkin') || text.includes('lavender')) {
    return PRODUCT_IMAGE_REGISTRY.PET_LAVENDER_WIPES;
  }

  // 7. Health, Supplements & Medical
  if (text.includes('toothpaste') || text.includes('virbac') || text.includes('enzymatic')) {
    return PRODUCT_IMAGE_REGISTRY.DENTAL_TOOTHPASTE_KIT;
  }
  if (text.includes('first aid') || text.includes('trauma') || text.includes('emergency kit') || text.includes('medical kit')) {
    return PRODUCT_IMAGE_REGISTRY.FIRST_AID_KIT;
  }
  if (text.includes('nutri-plus') || text.includes('energy gel') || text.includes('energy paste')) {
    return PRODUCT_IMAGE_REGISTRY.NUTRITIONAL_ENERGY_GEL;
  }
  if (text.includes('vitamin') || text.includes('supplement') || text.includes('beaphar')) {
    return PRODUCT_IMAGE_REGISTRY.VITAMIN_SUPPLEMENT;
  }
  if (text.includes('flea') || text.includes('tick') || text.includes('spot-on') || text.includes('frontline')) {
    return PRODUCT_IMAGE_REGISTRY.TICK_FLEA_TREATMENT;
  }

  // 8. Beds & Furniture
  if (text.includes('donut') || text.includes('calming bed') || text.includes('shag')) {
    return PRODUCT_IMAGE_REGISTRY.DONUT_PET_BED;
  }
  if (text.includes('orthopedic') || text.includes('memory foam') || text.includes('dog bed')) {
    return PRODUCT_IMAGE_REGISTRY.ORTHOPEDIC_BED;
  }
  if (text.includes('cat tree') || text.includes('condo') || text.includes('scratching post')) {
    return PRODUCT_IMAGE_REGISTRY.CAT_TREE_CONDO;
  }

  // 9. Species-specific generic fallbacks
  if (text.includes('cat') || text.includes('kitten') || text.includes('feline')) {
    return PRODUCT_IMAGE_REGISTRY.CAT_DEFAULT;
  }
  if (text.includes('dog') || text.includes('puppy') || text.includes('canine')) {
    return PRODUCT_IMAGE_REGISTRY.DOG_DEFAULT;
  }

  return PRODUCT_IMAGE_REGISTRY.GENERAL_DEFAULT;
}

/**
 * Returns the best image URL for a product, validating existing URLs and
 * detecting mismatched or missing images.
 */
export function getProductImageUrl(product) {
  if (!product) return PRODUCT_IMAGE_REGISTRY.GENERAL_DEFAULT;

  const name = (product.name || '').toLowerCase();
  if (name.includes('shampoo') || name.includes('erina') || (name.includes('himalaya') && name.includes('shampoo'))) {
    return PRODUCT_IMAGE_REGISTRY.HIMALAYA_ERINA_SHAMPOO;
  }
  if (name.includes('wipe') || name.includes('wipes')) {
    return PRODUCT_IMAGE_REGISTRY.PET_LAVENDER_WIPES;
  }

  const url = product.imageUrl || product.image_url;

  // List of known mismatched URLs in legacy seed data
  const isMismatchedLegacy =
    url &&
    (url.includes('photo-1701992678972-d5a053ad0fb0') ||
     url.includes('photo-1734599895291-d25a27e4cb45') ||
     (product.name?.toLowerCase().includes('dog food') && (url.includes('photo-1589924691995-400dc9edfabb') || url.includes('photo-1589924691995-400dc9ecc119'))) ||
     (product.name?.toLowerCase().includes('travel crate') && (url.includes('photo-1601758003122-53c40e686a19') || url.includes('photo-1548767797-d8c844163c4c'))) ||
     (product.name?.toLowerCase().includes('laser ball') && (url.includes('photo-1587300003388-59208cc962cb') || url.includes('photo-1615789591457-74a63395c990'))) ||
     (product.name?.toLowerCase().includes('rope') && url.includes('photo-1601758124510-52d02ddb7cbd')) ||
     (product.name?.toLowerCase().includes('shampoo') && (url.includes('photo-1585664811087-47f65abbad64') || url.includes('photo-1583337130417-3346a1be7dee') || url.includes('photo-1602143407151-7111542de6e8') || url.includes('photo-1701992678972-d5a053ad0fb0'))) ||
     (product.name?.toLowerCase().includes('nail clipper') && (url.includes('photo-1516734212186-a967f81ad0d7') || url.includes('photo-1585664811087-47f65abbad64'))) ||
     (product.name?.toLowerCase().includes('collar') && (url.includes('photo-1601758228041-f3b2795255f1'))) ||
     (product.name?.toLowerCase().includes('harness') && (url.includes('photo-1544568100-847a948585b9'))) ||
     (product.name?.toLowerCase().includes('wipes') && (url.includes('photo-1585664811087-47f65abbad64') || url.includes('photo-1559214369-a6b1d7919865') || url.includes('photo-1734599895291-d25a27e4cb45'))) ||
     (product.name?.toLowerCase().includes('squirrel') && (url.includes('photo-1535294435445-d7249524ef2e') || url.includes('photo-1576201836106-db1758fd1c97'))));

  if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) && !isMismatchedLegacy) {
    return url;
  }

  // Analyze name and provide the accurate contextual image
  return analyzeProductNameAndGetImage(product);
}

export default {
  PRODUCT_IMAGE_REGISTRY,
  analyzeProductNameAndGetImage,
  getProductImageUrl
};
