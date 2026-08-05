package com.petzoe.api.config;

import com.petzoe.api.entity.Category;
import com.petzoe.api.entity.Product;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.CategoryRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the marketplace with categories, a seller user, and sample products on first run.
 * Only runs if no categories exist yet (prevents duplicate data on restarts).
 */
@Component
@Order(2) // Run after the main DatabaseInitializer
public class MarketplaceDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MarketplaceDataInitializer(CategoryRepository categoryRepository,
                                       ProductRepository productRepository,
                                       UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if categories table is empty
        if (categoryRepository.count() > 0) {
            return;
        }

        System.out.println("=== Seeding Marketplace Data ===");

        // 1. Create categories
        Category food = categoryRepository.save(new Category("Pet Food",
                "Premium nutrition for dogs, cats, and small animals",
                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=300"));
        Category medicine = categoryRepository.save(new Category("Medicines",
                "Veterinary medicines, supplements, and health boosters",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300"));
        Category grooming = categoryRepository.save(new Category("Grooming",
                "Shampoos, brushes, nail clippers, and grooming kits",
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=300"));
        Category toys = categoryRepository.save(new Category("Toys",
                "Interactive toys, chew toys, and puzzle feeders",
                "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=300"));
        Category accessories = categoryRepository.save(new Category("Accessories",
                "Collars, leashes, beds, carriers, and bowls",
                "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=300"));
        Category healthcare = categoryRepository.save(new Category("Healthcare Products",
                "First aid kits, dental care, eye care, and wellness products",
                "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=300"));

        // 2. Create a seller user (if not exists)
        User seller = userRepository.findByEmail("seller@petzoe.com").orElseGet(() ->
                userRepository.save(new User("PetZoe Official Store", "seller@petzoe.com",
                        passwordEncoder.encode("seller123"), "9876543210", "Marketplace Seller"))
        );

        // 3. Create sample products
        createProduct("Royal Canin Adult Dog Food", "Complete nutrition for adult dogs aged 1-7 years. Supports healthy digestion and optimal body condition.",
                "Royal Canin", 2499.00, 1999.00, "RC-DOG-001", 50,
                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500",
                "Chicken, Rice, Corn, Animal Fats, Wheat", "Weight: 3kg | Age: Adult | Breed Size: All", food, seller, true, true);

        createProduct("Whiskas Cat Food – Tuna Flavor", "Delicious tuna-flavored dry food for adult cats. Rich in Omega-3 fatty acids.",
                "Whiskas", 899.00, 749.00, "WK-CAT-001", 80,
                "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=500",
                "Tuna, Rice, Soybean, Vitamins", "Weight: 1.2kg | Flavor: Tuna | Age: Adult", food, seller, true, true);

        createProduct("Frontline Plus Flea & Tick Treatment", "Veterinarian-recommended flea and tick treatment for dogs. Kills fleas within 12 hours.",
                "Frontline", 1299.00, null, "FL-MED-001", 30,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500",
                "Fipronil, S-methoprene", "Dosage: Monthly | Weight Range: 5-22 lbs | Species: Dog", medicine, seller, true, true);

        createProduct("Pet Multivitamin Supplement", "Daily vitamin and mineral supplement for dogs and cats. Supports immunity and joint health.",
                "VetPlus", 599.00, 499.00, "VP-MED-002", 100,
                "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=500",
                "Vitamin A, D3, E, Calcium, Zinc", "Count: 60 tablets | Type: Chewable | For: Dogs & Cats", medicine, seller, true, false);

        createProduct("FURminator deShedding Tool", "Reduces shedding by up to 90%. Stainless steel edge reaches beneath topcoat for gentle undercoat removal.",
                "FURminator", 1899.00, 1599.00, "FM-GRM-001", 25,
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=500",
                null, "Size: Medium | For: Dogs | Coat: Short Hair", grooming, seller, true, true);

        createProduct("Oatmeal Dog Shampoo", "Gentle, soap-free formula with colloidal oatmeal. Relieves dry, itchy skin and leaves coat silky smooth.",
                "Burt's Bees", 449.00, null, "BB-GRM-002", 60,
                "https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&q=80&w=500",
                "Colloidal Oatmeal, Honey, Beeswax", "Volume: 473ml | pH Balanced | Tearless", grooming, seller, true, false);

        createProduct("KONG Classic Dog Toy", "The gold standard of dog toys. Stuff with treats for hours of enrichment. Ultra-durable natural rubber.",
                "KONG", 699.00, 599.00, "KG-TOY-001", 45,
                "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=500",
                null, "Size: Medium | Material: Natural Rubber | Color: Red", toys, seller, true, true);

        createProduct("Interactive Puzzle Feeder", "Stimulate your pet's mind with this slow-feeder puzzle toy. Reduces boredom and promotes problem-solving.",
                "Outward Hound", 999.00, null, "OH-TOY-002", 35,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=500",
                null, "Difficulty: Level 2 | Material: BPA-Free Plastic | Dishwasher Safe", toys, seller, true, false);

        createProduct("Premium Leather Dog Collar", "Handcrafted genuine leather collar with heavy-duty brass buckle. Classic design with modern durability.",
                "Mendota", 1499.00, 1199.00, "MD-ACC-001", 40,
                "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=500",
                null, "Size: Adjustable 14-20in | Material: Full Grain Leather | Color: Brown", accessories, seller, true, true);

        createProduct("Orthopedic Memory Foam Pet Bed", "Therapeutic support for aging or arthritic pets. Waterproof liner with removable, machine-washable cover.",
                "PetFusion", 3499.00, 2999.00, "PF-ACC-002", 20,
                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=500",
                null, "Size: Large 36x28in | Fill: 4-inch Memory Foam | Cover: Twill", accessories, seller, true, false);

        createProduct("Pet First Aid Kit", "Complete emergency kit for pets. Contains bandages, antiseptic wipes, tweezers, and a pet care guide.",
                "RC Pet Products", 799.00, null, "RC-HC-001", 55,
                "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&q=80&w=500",
                null, "Items: 45 pieces | Bag: Water-Resistant | Includes: Pet Care Guide", healthcare, seller, true, true);

        createProduct("Enzymatic Dog Toothpaste & Brush Set", "Veterinarian-recommended dental care kit. Poultry-flavored toothpaste dogs love.",
                "Virbac", 349.00, 299.00, "VB-HC-002", 70,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=500",
                "Enzymatic formula, Poultry flavor", "Includes: Toothpaste + Dual-Head Brush | For: Dogs | Flavor: Poultry", healthcare, seller, true, false);

        System.out.println("=== Marketplace Data Seeded Successfully ===");
    }

    private void createProduct(String name, String description, String brand,
                                Double price, Double discountPrice, String sku,
                                Integer stockQuantity, String imageUrl,
                                String ingredients, String specifications,
                                Category category, User seller,
                                boolean approved, boolean featured) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setBrand(brand);
        product.setPrice(price);
        product.setDiscountPrice(discountPrice);
        product.setSku(sku);
        product.setStockQuantity(stockQuantity);
        product.setImageUrl(imageUrl);
        product.setIngredients(ingredients);
        product.setSpecifications(specifications);
        product.setCategory(category);
        product.setSeller(seller);
        product.setApproved(approved);
        product.setFeatured(featured);
        product.setAverageRating(3.5 + Math.random() * 1.5); // Random 3.5-5.0 for demo
        product.setReviewCount((int) (5 + Math.random() * 45)); // Random 5-50 reviews
        productRepository.save(product);
    }
}
