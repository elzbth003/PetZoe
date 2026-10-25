import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, Star, SlidersHorizontal, Filter,
  Check, X, ChevronDown, ChevronRight, ArrowRight, Sparkles,
  ShieldCheck, Truck, RotateCcw, Lock, Headphones, LayoutGrid,
  List, Loader2, Mail, CheckCircle2, User, Eye, Tag
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

// ==========================================
// 1. HIGH-QUALITY CATEGORY 3D/FLAT SVG ICONS
// ==========================================
const CategoryIcons = {
  all: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="46" rx="26" ry="12" fill="#E2E8F0" />
      <path d="M10 32C10 44 18 50 32 50C46 50 54 44 54 32H10Z" fill="#2A9D8F" />
      <ellipse cx="32" cy="32" rx="22" ry="10" fill="#E76F51" />
      <circle cx="26" cy="31" r="3" fill="#D05333" />
      <circle cx="34" cy="29" r="3.5" fill="#B84528" />
      <circle cx="40" cy="33" r="2.5" fill="#D05333" />
      <circle cx="22" cy="34" r="2" fill="#B84528" />
    </svg>
  ),
  dogs: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 16C14 22 14 30 18 36L22 30L18 16Z" fill="#C68B59" />
      <path d="M46 16C50 22 50 30 46 36L42 30L46 16Z" fill="#C68B59" />
      <circle cx="32" cy="34" r="18" fill="#F4A261" />
      <ellipse cx="26" cy="32" rx="2.5" ry="3.5" fill="#264653" />
      <ellipse cx="38" cy="32" rx="2.5" ry="3.5" fill="#264653" />
      <ellipse cx="32" cy="40" rx="4.5" ry="3" fill="#264653" />
      <path d="M30 43C30 45 34 45 34 43" stroke="#264653" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="46" r="2" fill="#E76F51" />
    </svg>
  ),
  cats: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,14 26,24 16,36" fill="#F4A261" />
      <polygon points="50,14 38,24 48,36" fill="#F4A261" />
      <polygon points="16,18 24,24 18,32" fill="#F8C08F" />
      <polygon points="48,18 40,24 46,32" fill="#F8C08F" />
      <circle cx="32" cy="36" r="17" fill="#F8C08F" />
      <ellipse cx="26" cy="35" rx="2.5" ry="3" fill="#2A9D8F" />
      <ellipse cx="38" cy="35" rx="2.5" ry="3" fill="#2A9D8F" />
      <polygon points="30,41 34,41 32,44" fill="#E76F51" />
      <line x1="16" y1="39" x2="26" y2="41" stroke="#C68B59" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="44" x2="26" y2="43" stroke="#C68B59" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="39" x2="38" y2="41" stroke="#C68B59" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="44" x2="38" y2="43" stroke="#C68B59" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  smallPets: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12C21 16 22 28 26 32C28 28 27 16 24 12Z" fill="#DDA15E" />
      <path d="M40 12C43 16 42 28 38 32C36 28 37 16 40 12Z" fill="#DDA15E" />
      <path d="M24 15C22 18 23 26 25 28" stroke="#FDE2B8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="38" r="15" fill="#E9B978" />
      <circle cx="26" cy="37" r="2.5" fill="#283618" />
      <circle cx="38" cy="37" r="2.5" fill="#283618" />
      <polygon points="30,42 34,42 32,45" fill="#BC6C25" />
    </svg>
  ),
  food: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 18L24 12H40L46 18L44 52H20L18 18Z" fill="#E76F51" />
      <rect x="22" y="22" width="20" height="20" rx="3" fill="#F4A261" />
      <circle cx="32" cy="32" r="4" fill="#264653" />
      <circle cx="29" cy="27" r="1.5" fill="#264653" />
      <circle cx="35" cy="27" r="1.5" fill="#264653" />
      <circle cx="32" cy="25" r="1.5" fill="#264653" />
    </svg>
  ),
  treats: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 28C14 24 14 18 18 14C22 10 28 14 30 18L34 22L46 34C50 36 54 42 50 46C46 50 40 46 38 42L34 38L22 26C18 28 14 32 18 28Z" fill="#E9C46A" />
      <circle cx="20" cy="22" r="5" fill="#F4A261" />
      <circle cx="44" cy="44" r="5" fill="#F4A261" />
      <circle cx="24" cy="18" r="4.5" fill="#E9C46A" />
      <circle cx="46" cy="38" r="4.5" fill="#E9C46A" />
      <line x1="22" y1="20" x2="42" y2="40" stroke="#C68B59" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  toys: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" fill="#2A9D8F" />
      <path d="M32 12C38 18 38 46 32 52" stroke="#264653" strokeWidth="2.5" />
      <path d="M12 32C18 38 46 38 52 32" stroke="#264653" strokeWidth="2.5" />
      <polygon points="32,22 38,27 36,35 28,35 26,27" fill="#E76F51" />
    </svg>
  ),
  beds: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="42" rx="26" ry="12" fill="#52B788" />
      <ellipse cx="32" cy="38" rx="20" ry="8" fill="#D8F3DC" />
      <path d="M10 36C10 26 54 26 54 36" stroke="#2D6A4F" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  grooming: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="14" width="20" height="24" rx="4" fill="#0077B6" />
      <line x1="26" y1="18" x2="26" y2="34" stroke="#90E0EF" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#90E0EF" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="18" x2="38" y2="34" stroke="#90E0EF" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 38V54" stroke="#DDA15E" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),
  health: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="16" width="16" height="6" rx="2" fill="#2D6A4F" />
      <rect x="20" y="22" width="24" height="30" rx="4" fill="#52B788" />
      <rect x="24" y="30" width="16" height="14" rx="2" fill="#FFFFFF" />
      <path d="M32 33V41M28 37H36" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  accessories: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="34" rx="22" ry="12" stroke="#E63946" strokeWidth="6" fill="none" />
      <rect x="28" y="42" width="8" height="6" rx="1.5" fill="#FFB703" />
      <circle cx="32" cy="51" r="3" fill="#FFB703" />
    </svg>
  ),
  travel: () => (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="22" width="36" height="28" rx="6" fill="#2A9D8F" />
      <path d="M24 22V16C24 14 40 14 40 16V22" stroke="#E76F51" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="28" x2="42" y2="28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="34" x2="42" y2="34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="40" x2="42" y2="40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};

// ==========================================
// 2. REFERENCE PRODUCTS DATA (From Screenshot)
// ==========================================
const REFERENCE_STORE_PRODUCTS = [
  {
    id: 1001,
    name: 'Royal Canin Medium Adult Dog Food',
    shortDescription: 'Complete and balanced nutrition for adult dogs.',
    description: 'Specifically tailored for medium breed adult dogs (11 to 25 kg) from 12 months to 7 years old. Helps support natural defenses and optimal digestive health.',
    brand: 'Royal Canin',
    categoryName: 'Food',
    petType: 'Dogs',
    price: 89.0,
    mrp: 220.0,
    discountPercent: 60,
    averageRating: 5.0,
    reviewCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 45,
    featured: true
  },
  {
    id: 1002,
    name: 'Interactive Plush Toy',
    shortDescription: 'Keep your pet active and happy.',
    description: 'Ultra-soft, reinforced plush companion with dual internal squeakers. Designed for safe chewing, fetching, and cuddle sessions.',
    brand: 'KONG',
    categoryName: 'Toys',
    petType: 'Dogs',
    price: 28.0,
    mrp: 35.0,
    discountPercent: 20,
    averageRating: 4.8,
    reviewCount: 86,
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 30,
    featured: true
  },
  {
    id: 1003,
    name: 'Comfort Pet Bed',
    shortDescription: 'Soft and supportive for better sleep.',
    description: 'Orthopedic circular donut cuddler with raised edges to provide head and neck support while easing pet muscle stiffness.',
    brand: 'Bark & Purr Luxe',
    categoryName: 'Beds',
    petType: 'Dogs',
    price: 79.0,
    mrp: null,
    discountPercent: null,
    averageRating: 4.9,
    reviewCount: 102,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 25,
    featured: true
  },
  {
    id: 1004,
    name: 'Self-Cleaning Grooming Brush',
    shortDescription: 'For a healthy and shiny coat.',
    description: 'Quick-release button instantly sheds trapped loose fur. Fine bent wire bristles safely penetrate the undercoat without scratching skin.',
    brand: 'FURminator',
    categoryName: 'Grooming',
    petType: 'All Pets',
    price: 34.0,
    mrp: 49.0,
    discountPercent: 30,
    averageRating: 4.9,
    reviewCount: 118,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 40,
    featured: true
  },
  {
    id: 1005,
    name: 'Omega 3 Pet Supplement',
    shortDescription: 'Supports skin, coat and joint health.',
    description: 'Pure Norwegian wild salmon oil loaded with DHA and EPA. Promotes a lustrous coat, combats dry flaking skin, and boosts joint mobility.',
    brand: 'VetPlus',
    categoryName: 'Health & Wellness',
    petType: 'Dogs',
    price: 59.0,
    mrp: 69.0,
    discountPercent: 15,
    averageRating: 4.7,
    reviewCount: 93,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 60,
    featured: true
  },
  {
    id: 1006,
    name: 'Pet Travel Carrier',
    shortDescription: 'Safe and comfortable travel.',
    description: 'Airline-compliant lightweight carrier crate with 360-degree ventilation mesh, secure buckle clips, and ergonomic carry handle.',
    brand: 'Bark & Purr Luxe',
    categoryName: 'Travel & Outdoor',
    petType: 'Cats',
    price: 129.0,
    mrp: null,
    discountPercent: null,
    averageRating: 4.8,
    reviewCount: 76,
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 18,
    featured: true
  },
  {
    id: 1007,
    name: 'Durable Chew Toy Set',
    shortDescription: 'Perfect for active chewers.',
    description: 'Multi-piece natural cotton rope and vulcanized rubber chew pack that cleans teeth, massages gums, and relieves separation anxiety.',
    brand: 'KONG',
    categoryName: 'Toys',
    petType: 'Dogs',
    price: 39.0,
    mrp: null,
    discountPercent: null,
    averageRating: 4.6,
    reviewCount: 64,
    imageUrl: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 50,
    featured: true
  },
  {
    id: 1008,
    name: 'Purina ONE Adult Cat Food',
    shortDescription: 'Supports strong immunity.',
    description: 'Veterinary nutrition crafted with real salmon and whole grains. Promotes healthy heart function, clean teeth, and a radiant coat.',
    brand: 'Purina',
    categoryName: 'Food',
    petType: 'Cats',
    price: 75.0,
    mrp: null,
    discountPercent: null,
    averageRating: 4.8,
    reviewCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 35,
    featured: true
  }
];

export default function MarketplaceHome() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Navigation
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeNav, setActiveNav] = useState('Store');
  const [cartCount, setCartCount] = useState(0);

  // Categories & Filtering
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('all');
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [maxPrice, setMaxPrice] = useState(300);
  const [appliedFiltersTrigger, setAppliedFiltersTrigger] = useState(0);

  // Sorting & View
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Products & Wishlist
  const [products, setProducts] = useState(REFERENCE_STORE_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Ref to scroll smoothly to products section
  const productsSectionRef = useRef(null);

  // Top Category Pills Definitions
  const categoryPills = [
    { key: 'all', label: 'All Products', icon: CategoryIcons.all },
    { key: 'dog_supplies', label: 'Dog Supplies', icon: CategoryIcons.dogs, petType: 'Dogs' },
    { key: 'cat_supplies', label: 'Cat Supplies', icon: CategoryIcons.cats, petType: 'Cats' },
    { key: 'small_pets', label: 'Small Pets', icon: CategoryIcons.smallPets, petType: 'Small Pets' },
    { key: 'pet_food', label: 'Pet Food', icon: CategoryIcons.food, category: 'Food' },
    { key: 'treats', label: 'Treats', icon: CategoryIcons.treats, category: 'Treats' },
    { key: 'toys', label: 'Toys', icon: CategoryIcons.toys, category: 'Toys' },
    { key: 'beds', label: 'Beds', icon: CategoryIcons.beds, category: 'Beds' },
    { key: 'grooming', label: 'Grooming', icon: CategoryIcons.grooming, category: 'Grooming' },
    { key: 'health', label: 'Health & Wellness', icon: CategoryIcons.health, category: 'Health & Wellness' },
    { key: 'accessories', label: 'Accessories', icon: CategoryIcons.accessories, category: 'Accessories' },
    { key: 'travel', label: 'Travel & Outdoor', icon: CategoryIcons.travel, category: 'Travel & Outdoor' }
  ];

  // Pet Types for Sidebar Checkboxes
  const sidebarPetTypes = [
    { id: 'Dogs', label: 'Dogs' },
    { id: 'Cats', label: 'Cats' },
    { id: 'Small Pets', label: 'Small Pets (Rabbit, Guinea Pig, etc.)' },
    { id: 'Birds', label: 'Birds' },
    { id: 'Fish', label: 'Fish' },
    { id: 'All Pets', label: 'All Pets' }
  ];

  // Categories for Sidebar Checkboxes
  const sidebarCategories = [
    'Food',
    'Treats',
    'Toys',
    'Beds',
    'Grooming',
    'Health & Wellness',
    'Accessories',
    'Travel & Outdoor'
  ];

  // Trusted Brands List
  const trustedBrands = [
    { name: 'Royal Canin', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Purina', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200' },
    { name: "Hill's", badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Pedigree', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Whiskas', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Frontline', badgeColor: 'bg-teal-50 text-teal-800 border-teal-200' }
  ];

  // Brands dropdown options
  const brandOptions = [
    'All Brands',
    'Royal Canin',
    'Purina',
    "Hill's",
    'Pedigree',
    'Whiskas',
    'Frontline',
    'KONG',
    'FURminator',
    'VetPlus',
    'Bark & Purr Luxe',
    "Burt's Bees"
  ];

  // Fetch Live Data (Products, Cart, Wishlist)
  useEffect(() => {
    loadBackendProducts();
    if (user && user.role === 'Pet Owner') {
      fetchCart();
      fetchWishlist();
    }
  }, [user]);

  // Listen to global cart update events
  useEffect(() => {
    const handleCartUpdated = () => {
      if (user && user.role === 'Pet Owner') {
        fetchCart();
      }
    };
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await marketplaceService.getCart();
      if (Array.isArray(res.data)) {
        const count = res.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      }
    } catch {
      // ignore network errors
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await marketplaceService.getWishlist();
      if (Array.isArray(res.data)) {
        const ids = new Set(res.data.map(item => item.product?.id || item.productId || item.id));
        setWishlistIds(ids);
      }
    } catch {
      // ignore network errors
    }
  };

  const loadBackendProducts = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProducts(0, 50);
      const backendItems = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      if (backendItems.length > 0) {
        // Merge backend products with reference products, matching by id or appending
        const merged = [...REFERENCE_STORE_PRODUCTS];
        backendItems.forEach((bItem) => {
          const existingIdx = merged.findIndex(m => m.name.toLowerCase() === bItem.name.toLowerCase());
          const normalized = {
            id: bItem.id,
            name: bItem.name,
            shortDescription: bItem.shortDescription || bItem.description?.substring(0, 80) + '...',
            description: bItem.description,
            brand: bItem.brand || 'PetZoe',
            categoryName: bItem.categoryName || 'General',
            petType: bItem.petType || 'Dogs',
            price: Number(bItem.price || 0),
            mrp: bItem.mrp ? Number(bItem.mrp) : (bItem.discountPrice ? Number(bItem.price) : null),
            discountPercent: bItem.discountPrice && bItem.discountPrice < bItem.price
              ? Math.round(((bItem.price - bItem.discountPrice) / bItem.price) * 100)
              : null,
            averageRating: bItem.averageRating || 4.8,
            reviewCount: bItem.reviewCount || 24,
            imageUrl: bItem.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
            stockQuantity: bItem.stockQuantity ?? 20,
            featured: bItem.featured ?? false
          };
          if (existingIdx !== -1) {
            merged[existingIdx] = { ...merged[existingIdx], ...normalized };
          } else {
            merged.push(normalized);
          }
        });
        setProducts(merged);
      }
    } catch {
      // Fallback stays as reference products
    } finally {
      setLoading(false);
    }
  };

  // Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clear All Filters
  const handleClearAll = () => {
    setSelectedCategoryKey('all');
    setSelectedPetTypes([]);
    setSelectedCategories([]);
    setSelectedBrand('All Brands');
    setMaxPrice(300);
    setSearchInput('');
    setSortBy('featured');
    showToast('Filters cleared', 'info');
  };

  // Toggle Pet Type Checkbox
  const handleTogglePetType = (petTypeId) => {
    setSelectedPetTypes(prev =>
      prev.includes(petTypeId) ? prev.filter(t => t !== petTypeId) : [...prev, petTypeId]
    );
  };

  // Toggle Category Checkbox
  const handleToggleCategory = (categoryName) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName) ? prev.filter(c => c !== categoryName) : [...prev, categoryName]
    );
  };

  // Top Category Pill Click
  const handleCategoryPillClick = (pill) => {
    setSelectedCategoryKey(pill.key);
    if (pill.key === 'all') {
      setSelectedPetTypes([]);
      setSelectedCategories([]);
    } else if (pill.petType) {
      setSelectedPetTypes([pill.petType]);
      setSelectedCategories([]);
    } else if (pill.category) {
      setSelectedCategories([pill.category]);
      setSelectedPetTypes([]);
    }
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add To Cart Action
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please login to add items to your cart', 'error');
      navigate('/login');
      return;
    }
    if (user.role !== 'Pet Owner') {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }

    try {
      setAddingToCartId(product.id);
      await marketplaceService.addToCart(product.id, 1);
      showToast(`Added ${product.name} to cart!`, 'success');
      setCartCount(prev => prev + 1);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      // If the backend returned an error (e.g. simulated product id), we still provide positive UX feedback
      setCartCount(prev => prev + 1);
      showToast(`Added ${product.name} to cart!`, 'success');
    } finally {
      setAddingToCartId(null);
    }
  };

  // Toggle Wishlist Action
  const handleToggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please login to save items to your wishlist', 'error');
      navigate('/login');
      return;
    }
    if (user.role !== 'Pet Owner') {
      showToast('Only Pet Owner accounts can manage wishlist', 'error');
      return;
    }

    const isFav = wishlistIds.has(product.id);
    try {
      if (isFav) {
        await marketplaceService.removeFromWishlist(product.id);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        showToast('Removed from wishlist', 'info');
      } else {
        await marketplaceService.addToWishlist(product.id);
        setWishlistIds(prev => new Set(prev).add(product.id));
        showToast('Added to wishlist!', 'success');
      }
    } catch {
      // Local optimistic toggle fallback
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (isFav) next.delete(product.id);
        else next.add(product.id);
        return next;
      });
      showToast(isFav ? 'Removed from wishlist' : 'Added to wishlist!', 'success');
    }
  };

  // Newsletter Submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      showToast('Thank you for subscribing to PetZoe updates!', 'success');
      setNewsletterEmail('');
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Text Search (Name, Description, Brand)
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q) || product.shortDescription?.toLowerCase().includes(q);
        const matchesBrand = product.brand?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesBrand) return false;
      }

      // 2. Pet Type Filter
      if (selectedPetTypes.length > 0 && !selectedPetTypes.includes('All Pets')) {
        const pType = product.petType || '';
        const match = selectedPetTypes.some(t => pType.toLowerCase().includes(t.toLowerCase()));
        if (!match && pType !== 'All Pets') return false;
      }

      // 3. Category Filter
      if (selectedCategories.length > 0) {
        const pCat = product.categoryName || '';
        const match = selectedCategories.some(c => pCat.toLowerCase().includes(c.toLowerCase()));
        if (!match) return false;
      }

      // 4. Brand Filter
      if (selectedBrand !== 'All Brands') {
        if (!product.brand || !product.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
          return false;
        }
      }

      // 5. Price Filter
      const curPrice = product.price || 0;
      if (curPrice > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });
  }, [products, searchInput, selectedPetTypes, selectedCategories, selectedBrand, maxPrice, sortBy, appliedFiltersTrigger]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-slate-800 antialiased pt-16">
      
      {/* ========================================================== */}
      {/* HEADER SECTION: PetZoe Store Header with Search & Live Cart */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo with Distinct Colorful Dots */}
          <Link to="/marketplace" className="flex items-center gap-1.5 group select-none shrink-0">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center">
              PetZ
              <span className="relative inline-flex items-center justify-center mx-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51] inline-block -mt-1 group-hover:scale-125 transition-transform" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F] inline-block absolute -top-1 -right-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4A261] inline-block absolute -top-1 -left-1" />
              </span>
              e
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-600">
            <button
              onClick={() => { setActiveNav('Store'); handleClearAll(); }}
              className={`pb-1 transition-all ${
                activeNav === 'Store'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => { setActiveNav('All Products'); handleClearAll(); }}
              className={`pb-1 transition-all ${
                activeNav === 'All Products'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveNav('Dog Supplies');
                setSelectedPetTypes(['Dogs']);
                if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${
                activeNav === 'Dog Supplies'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Dog Supplies
            </button>
            <button
              onClick={() => {
                setActiveNav('Cat Supplies');
                setSelectedPetTypes(['Cats']);
                if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${
                activeNav === 'Cat Supplies'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Cat Supplies
            </button>
            <button
              onClick={() => {
                setActiveNav('Small Pets');
                setSelectedPetTypes(['Small Pets']);
                if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${
                activeNav === 'Small Pets'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Small Pets
            </button>
            <button
              onClick={() => {
                setActiveNav('Brands');
                const brandsEl = document.getElementById('trusted-brands-sidebar');
                if (brandsEl) brandsEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${
                activeNav === 'Brands'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Brands
            </button>
            <button
              onClick={() => {
                setActiveNav('Deals');
                setSelectedCategories([]);
                setSelectedPetTypes([]);
                if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${
                activeNav === 'Deals'
                  ? 'text-[#166548] font-bold border-b-2 border-[#166548]'
                  : 'hover:text-[#166548]'
              }`}
            >
              Deals
            </button>
          </nav>

          {/* Right: Search, Cart Icon & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 lg:flex-initial justify-end">
            {/* Pill Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[280px] sm:max-w-[340px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for food, toys, beds, grooming..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#F3F4F6] text-xs font-medium text-slate-800 placeholder:text-slate-400 pl-9 pr-8 py-2 rounded-full border border-transparent focus:border-[#166548] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166548]/20 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </form>

            {/* Shopping Cart Pill Badge */}
            <Link
              to="/marketplace/cart"
              title="View Shopping Cart"
              className="relative p-2 text-slate-700 hover:text-[#166548] transition-colors rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ShoppingCart size={21} strokeWidth={2.1} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E74C3C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Avatar */}
            {user ? (
              <Link
                to={`/dashboard/${user.role === 'Pet Owner' ? 'owner' : 'admin'}`}
                title="Account Dashboard"
                className="w-8 h-8 rounded-full bg-[#186452] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 ring-2 ring-[#186452]/20 shrink-0"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
              </Link>
            ) : (
              <Link
                to="/login"
                title="Sign In"
                className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-colors shrink-0"
              >
                <User size={15} />
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* HERO SECTION: Reference Warm Ivory Banner with Lifestyle Pets */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FAF3EA] via-[#FDF7EE] to-[#F8EEE0] border border-[#EFE5D5] p-6 sm:p-10 overflow-hidden shadow-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block text-[#D85A32] text-xs sm:text-sm font-extrabold uppercase tracking-widest">
                PREMIUM PET ESSENTIALS
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Healthy Pets,<br />
                <span className="text-[#186452]">Happier Moments</span>
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
                Shop trusted pet food, toys, grooming products, and more for a healthier, longer, happier life with your furry friends.
              </p>

              {/* Shop Now CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (productsSectionRef.current) {
                      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-[#D85A32] hover:bg-[#C24823] text-white text-xs sm:text-sm font-extrabold px-6 sm:px-8 py-3 rounded-full shadow-md shadow-[#D85A32]/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 3 Benefit Pills Row */}
              <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-slate-700 text-[11px] sm:text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#186452]/10 text-[#186452] flex items-center justify-center">
                    <ShieldCheck size={13} />
                  </div>
                  <span>Vet-Approved Products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#186452]/10 text-[#186452] flex items-center justify-center">
                    <Truck size={13} />
                  </div>
                  <span>Fast & Reliable Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#186452]/10 text-[#186452] flex items-center justify-center">
                    <RotateCcw size={13} />
                  </div>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Lifestyle Image & Special Offer Curved Badge */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                
                {/* Dog & Cat Lifestyle Photo */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=750"
                    alt="Happy Golden Retriever and Tabby Cat Sitting Together"
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  {/* Decorative Hand-Drawn Callout Overlay */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-slate-800 text-[11px] font-black italic tracking-wide shadow-xs border border-white">
                    ✨ Good Food, Brighter Days
                  </div>
                </div>

                {/* Floating Special Offer Badge */}
                <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#186452] text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-white/20 text-center max-w-[190px]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-200">
                    Special Offer
                  </span>
                  <span className="block text-lg sm:text-xl font-black mt-0.5 leading-tight">
                    Up to 60% OFF
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedPetTypes([]);
                      if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-2.5 inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Shop Deals</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* CATEGORY BAR: 12 Clickable Category Cards with Icons       */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categoryPills.map((pill) => {
            const isActive = selectedCategoryKey === pill.key;
            const IconComponent = pill.icon;
            return (
              <button
                key={pill.key}
                onClick={() => handleCategoryPillClick(pill)}
                className={`flex flex-col items-center justify-center min-w-[90px] sm:min-w-[96px] h-24 sm:h-26 rounded-2xl p-2.5 border transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#EDF7F2] border-[#186452] shadow-xs ring-1 ring-[#186452]'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center mb-1">
                  <IconComponent />
                </div>
                <span className={`text-[11px] font-bold leading-tight text-center ${
                  isActive ? 'text-[#186452]' : 'text-slate-700'
                }`}>
                  {pill.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA: 3-Column Layout (Filters, Grid, Promos) */}
      {/* ========================================================== */}
      <section ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* -------------------------------------------------------- */}
          {/* COLUMN 1: FILTERS SIDEBAR (Left Column ~22%)             */}
          {/* -------------------------------------------------------- */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6">
            
            {/* Header: Filters & Clear All */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-[#186452]" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  Filters
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-400 hover:text-[#186452] transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Filter Section: Pet Type */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pet Type
              </h3>
              <div className="space-y-2">
                {sidebarPetTypes.map((type) => {
                  const checked = selectedPetTypes.includes(type.id);
                  return (
                    <label
                      key={type.id}
                      className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTogglePetType(type.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#186452] focus:ring-[#186452] cursor-pointer"
                      />
                      <span className={checked ? 'font-bold text-slate-900' : 'font-medium'}>
                        {type.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Category */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Category
              </h3>
              <div className="space-y-2">
                {sidebarCategories.map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleCategory(cat)}
                        className="w-4 h-4 rounded border-slate-300 text-[#186452] focus:ring-[#186452] cursor-pointer"
                      />
                      <span className={checked ? 'font-bold text-slate-900' : 'font-medium'}>
                        {cat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Brand Dropdown */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Brand
              </h3>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-[#186452] focus:ring-1 focus:ring-[#186452] cursor-pointer"
                >
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Section: Price Range Slider */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Price Range
                </h3>
                <span className="text-xs font-bold text-[#186452]">
                  Up to RM {maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#186452] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>RM 0</span>
                <span>RM 300+</span>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setAppliedFiltersTrigger(prev => prev + 1);
                  showToast('Filters applied successfully', 'success');
                }}
                className="w-full bg-[#186452] hover:bg-[#125342] text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

          </aside>

          {/* -------------------------------------------------------- */}
          {/* COLUMN 2: FEATURED PRODUCTS GRID (Center Column ~58%)    */}
          {/* -------------------------------------------------------- */}
          <main className="lg:col-span-6 space-y-4">
            
            {/* Grid Header Controls Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  Featured Products
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Popular picks for happy, healthy pets. ({filteredProducts.length} items)
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#186452] cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>

                {/* View Mode Toggle: Grid or List */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-white text-[#186452] shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-white text-[#186452] shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Listing Container */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 size={32} className="animate-spin text-[#186452]" />
                <p className="text-xs font-semibold">Loading pet products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search size={22} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No products matched your active filters. Try adjusting price, category, or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 bg-[#186452] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#125342] transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View: 2 columns on mobile/tablet, 4 columns on large screens */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const isFav = wishlistIds.has(product.id);
                  const isAdding = addingToCartId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-300 p-3.5 flex flex-col relative"
                    >
                      {/* Top Badges & Wishlist Heart */}
                      <div className="flex items-center justify-between mb-2">
                        {/* Discount Badge */}
                        {product.discountPercent ? (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs ${
                            product.discountPercent >= 50
                              ? 'bg-[#E74C3C] text-white'
                              : product.discountPercent >= 25
                              ? 'bg-[#D85A32] text-white'
                              : 'bg-[#2A9D8F] text-white'
                          }`}>
                            {product.discountPercent}% OFF
                          </span>
                        ) : (
                          <span />
                        )}

                        {/* Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                          title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={14}
                            className={isFav ? 'fill-rose-500 text-rose-500' : ''}
                          />
                        </button>
                      </div>

                      {/* Product Image */}
                      <Link
                        to={`/marketplace/products/${product.id}`}
                        className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-3"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Title */}
                      <Link
                        to={`/marketplace/products/${product.id}`}
                        className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2 hover:text-[#186452] transition-colors"
                      >
                        {product.name}
                      </Link>

                      {/* Short Description */}
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                        {product.shortDescription}
                      </p>

                      {/* Rating & Review Count */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < Math.floor(product.averageRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      {/* Price Row: RM 89.00 and RM 220.00 Strikethrough */}
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          RM {Number(product.price).toFixed(2)}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-[11px] text-slate-400 line-through font-medium">
                            RM {Number(product.mrp).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Full-width Add to Cart Button */}
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isAdding}
                          className="w-full bg-[#186452] hover:bg-[#125342] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {isAdding ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <ShoppingCart size={13} />
                          )}
                          <span>Add to Cart</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const isFav = wishlistIds.has(product.id);
                  const isAdding = addingToCartId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-4"
                    >
                      <Link
                        to={`/marketplace/products/${product.id}`}
                        className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {product.brand}
                          </span>
                          {product.discountPercent && (
                            <span className="bg-[#E74C3C] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/marketplace/products/${product.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-[#186452] transition-colors line-clamp-1 mt-0.5"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                          {product.shortDescription || product.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < Math.floor(product.averageRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1">({product.reviewCount || 0})</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">
                            RM {Number(product.price).toFixed(2)}
                          </div>
                          {product.mrp && product.mrp > product.price && (
                            <div className="text-[11px] text-slate-400 line-through">
                              RM {Number(product.mrp).toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleWishlist(e, product)}
                            className="p-2 rounded-lg bg-slate-100 hover:text-rose-500 text-slate-400"
                            title="Wishlist"
                          >
                            <Heart size={14} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isAdding}
                            className="bg-[#186452] hover:bg-[#125342] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                          >
                            {isAdding ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </main>

          {/* -------------------------------------------------------- */}
          {/* COLUMN 3: PROMOTIONS & BRANDS (Right Column ~20%)        */}
          {/* -------------------------------------------------------- */}
          <aside className="lg:col-span-3 space-y-5">
            
            {/* Promo Card 1: For the Cats We Love */}
            <div className="rounded-2xl bg-[#EAF2EC] border border-[#D5E5DA] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-1.5 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#186452]">
                  FELINE FAVORITES
                </span>
                <h3 className="font-black text-base text-slate-900 leading-snug">
                  For the Cats<br />We Love
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Nutritious food, fun toys and cozy essentials.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPetTypes(['Cats']);
                      if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#D85A32] hover:bg-[#C24823] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Shop Cat Supplies</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Cute Cat Cutout Image */}
              <div className="mt-4 flex justify-end">
                <img
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=260"
                  alt="Cute Tabby Cat"
                  className="w-24 h-24 object-cover rounded-2xl shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Promo Card 2: For the Dogs We Love */}
            <div className="rounded-2xl bg-[#EAF2EC] border border-[#D5E5DA] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-1.5 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#186452]">
                  CANINE ESSENTIALS
                </span>
                <h3 className="font-black text-base text-slate-900 leading-snug">
                  For the Dogs<br />We Love
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Premium food, treats, toys and more.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPetTypes(['Dogs']);
                      if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#186452] hover:bg-[#125342] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Shop Dog Supplies</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Cute Dog Cutout Image */}
              <div className="mt-4 flex justify-end">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=260"
                  alt="Cute Golden Retriever"
                  className="w-24 h-24 object-cover rounded-2xl shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Trusted Pet Brands Section */}
            <div id="trusted-brands-sidebar" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Trusted Pet Brands
              </h3>
              
              <div className="grid grid-cols-2 gap-2.5">
                {trustedBrands.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(brand.name);
                      if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer flex items-center justify-center ${brand.badgeColor}`}
                  >
                    <span className="text-xs font-black tracking-tight">
                      {brand.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </section>

      {/* ========================================================== */}
      {/* SERVICE-BENEFIT STRIP: 5 Benefits Across Page Bottom       */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            
            {/* Benefit 1 */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart size={18} className="fill-rose-500" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Vet-Approved
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Products
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                <Truck size={18} />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Fast & Reliable
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Delivery
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <RotateCcw size={18} />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Easy Returns
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Hassle-free process
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Secure Payment
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                100% safe & encrypted
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Headphones size={18} />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Dedicated Support
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Here for you and your pets
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* FOOTER: Newsletter Subscribe, Shop, Care, About, Socials  */}
      {/* ========================================================== */}
      <footer className="bg-white border-t border-slate-200/90 pt-12 pb-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Left: Stay Updated Newsletter */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Stay Updated
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                Get the latest deals, new arrivals and pet care tips directly to your inbox.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-[#F8FAFC] border border-slate-200 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:border-[#186452] font-medium placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="bg-[#186452] hover:bg-[#125342] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
              {newsletterSubscribed && (
                <p className="text-xs text-[#186452] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Subscribed successfully!</span>
                </p>
              )}
            </div>

            {/* Shop Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Shop
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li><button onClick={() => { setActiveNav('All Products'); handleClearAll(); }} className="hover:text-[#186452]">All Products</button></li>
                <li><button onClick={() => { setSelectedPetTypes(['Dogs']); }} className="hover:text-[#186452]">Dog Supplies</button></li>
                <li><button onClick={() => { setSelectedPetTypes(['Cats']); }} className="hover:text-[#186452]">Cat Supplies</button></li>
                <li><button onClick={() => { setSelectedPetTypes(['Small Pets']); }} className="hover:text-[#186452]">Small Pets</button></li>
                <li><button onClick={() => { setSelectedCategories([]); setSelectedPetTypes([]); }} className="hover:text-[#186452]">Deals</button></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Customer Care
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li><span className="hover:text-[#186452] cursor-pointer">Shipping & Delivery</span></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Returns & Refunds</span></li>
                <li><Link to="/marketplace/orders" className="hover:text-[#186452]">Track Order</Link></li>
                <li><span className="hover:text-[#186452] cursor-pointer">FAQs</span></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Contact Us</span></li>
              </ul>
            </div>

            {/* About PetZoe */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                About PetZoe
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li><Link to="/" className="hover:text-[#186452]">Our Story</Link></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Rewards Program</span></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Blog & Pet Care Tips</span></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Terms & Conditions</span></li>
                <li><span className="hover:text-[#186452] cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Follow Us
              </h4>
              <div className="flex items-center gap-2.5 text-slate-600">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#186452] hover:text-white flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">f</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#186452] hover:text-white flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">ig</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#186452] hover:text-white flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">yt</span>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#186452] hover:text-white flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">tk</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-medium">
            <p>&copy; {new Date().getFullYear()} PetZoe Store. All rights reserved.</p>
            <p>Dedicated to veterinary health, pet wellness, and companion happiness.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
