package com.petzoe.api.config;

import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds the database with demo data on first run.
 * User/Pet/Appointment data is seeded once (checked by userRepository.count).
 * Category/Product data is seeded separately (checked by categoryRepository.count),
 * so products are added even if users were already seeded before.
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository,
                               PetRepository petRepository,
                               AppointmentRepository appointmentRepository,
                               CategoryRepository categoryRepository,
                               ProductRepository productRepository,
                               CartItemRepository cartItemRepository,
                               WishlistItemRepository wishlistItemRepository,
                               OrderRepository orderRepository,
                               ReviewRepository reviewRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsersAndPets();
        seedMarketplace();
    }

    // ─── Users, Pets & Appointments ──────────────────────────────────────────

    private void seedUsersAndPets() {
        // Ensure Admin user always exists
        String adminEmail = System.getenv("ADMIN_EMAIL");
        if (adminEmail == null || adminEmail.isEmpty()) {
            adminEmail = "admin@petverse.com";
        }
        
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.isEmpty()) {
            adminPassword = "Password123!";
        }

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User("System Administrator", adminEmail,
                    passwordEncoder.encode(adminPassword), "9876543213", "Admin");
            admin.setVerificationStatus(VerificationStatus.APPROVED);
            userRepository.save(admin);
        }

        if (userRepository.count() > 1) return; // Only admin exists, seed rest

        User owner = new User("Alex Carter", "owner@petverse.com",
                passwordEncoder.encode("Password123!"), "9876543211", "Pet Owner");
        userRepository.save(owner);

        User vet = new User("Dr. Sarah Jenkins", "vet@petverse.com",
                passwordEncoder.encode("Password123!"), "9876543210", "Veterinarian");
        userRepository.save(vet);

        User shelter = new User("Emma Watson", "shelter@petverse.com",
                passwordEncoder.encode("Password123!"), "9876543212", "Shelter Manager");
        userRepository.save(shelter);

        Pet pet1 = new Pet("Milo", "Dog", "Golden Retriever", 2, "Male", 28.5,
                "Up-to-date",
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400",
                LocalDate.of(2024, 1, 15), "Golden", null, null, owner);
        petRepository.save(pet1);

        Pet pet2 = new Pet("Luna", "Cat", "Siamese", 1, "Female", 4.2,
                "Needs Vaccination",
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
                LocalDate.of(2025, 3, 20), "Cream & Brown", "Fish-based foods", null, owner);
        petRepository.save(pet2);

        Appointment appt = new Appointment(pet1, owner, vet,
                LocalDate.now().plusDays(3), "10:00 AM", "UPCOMING",
                "Routine checkup and rabies shot booster.");
        appointmentRepository.save(appt);
    }

    // ─── Categories & Products ────────────────────────────────────────────────

    private void seedMarketplace() {
        cartItemRepository.deleteAll();
        wishlistItemRepository.deleteAll();
        orderRepository.deleteAll();
        reviewRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        // Get or create a seller user
        User seller = userRepository.findByEmail("seller@petverse.com")
                .orElseGet(() -> {
                    User s = new User("PetZoe Store", "seller@petverse.com",
                            passwordEncoder.encode("Password123!"), "9876543214",
                            "Marketplace Seller");
                    return userRepository.save(s);
                });

        // ── Categories ────────────────────────────────────────────────────────
        Category food = categoryRepository.save(new Category(
                "Pet Food",
                "Premium nutrition for dogs, cats, birds, and small animals.",
                "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=400"));

        Category toys = categoryRepository.save(new Category(
                "Toys & Accessories",
                "Fun toys, chews, and interactive accessories to keep pets happy.",
                "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400"));

        Category grooming = categoryRepository.save(new Category(
                "Grooming",
                "Shampoos, brushes, clippers, and all grooming essentials.",
                "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=400"));

        Category health = categoryRepository.save(new Category(
                "Health & Wellness",
                "Supplements, medications, and preventive healthcare products.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400"));

        Category beds = categoryRepository.save(new Category(
                "Beds & Furniture",
                "Comfortable beds, crates, kennels, and cat trees.",
                "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"));

        // ── Products ─────────────────────────────────────────────────────────
        List<Product> products = List.of(

            // ── Pet Food ──────────────────────────────────────────────────────
            buildProduct("Royal Canin Adult Dog Food", "Complete and balanced nutrition for adult dogs. Rich in high-quality proteins.",
                "Royal Canin", 2499.0, 1999.0, "RC-DOG-ADULT-3KG", 85,
                "https://images.unsplash.com/photo-1589924691995-400dc9edfabb?auto=format&fit=crop&q=80&w=400",
                "Maize, Chicken meal, Wheat, Vegetable protein extracts, Chicken fat",
                "Weight: 3kg|Life stage: Adult (1-7 years)|Breed size: All breeds|Protein: 25%",
                true, true, food, seller),

            buildProduct("Whiskas Adult Cat Food Tuna", "Ocean-caught tuna in jelly for the ultimate feline dining experience.",
                "Whiskas", 1299.0, 999.0, "WHS-CAT-TUNA-2KG", 120,
                "https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&q=80&w=400",
                "Tuna (min. 4%), Fish & Fish derivatives, Meat & Animal derivatives",
                "Weight: 2kg|Life stage: Adult|Format: Dry pellets|Protein: 30%",
                true, true, food, seller),

            buildProduct("Pedigree Puppy Chicken & Milk", "Specially formulated dry food for puppies up to 12 months.",
                "Pedigree", 899.0, null, "PED-PUP-CKN-1KG", 200,
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400",
                "Whole grain corn, Poultry by-product meal, Soy meal, Beet pulp, Milk",
                "Weight: 1kg|Life stage: Puppy (0-12 months)|DHA for brain development",
                true, false, food, seller),

            buildProduct("Drools Adult Cat Fish & Chicken", "High protein cat food with fish and chicken for shiny coat and lean muscles.",
                "Drools", 799.0, 649.0, "DRL-CAT-FC-1.2KG", 95,
                "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=400",
                "Fish meal, Chicken meal, Rice, Corn, Sunflower oil, Taurine",
                "Weight: 1.2kg|Taurine enriched|Omega 3 & 6 for coat health",
                true, false, food, seller),

            // ── Toys & Accessories ────────────────────────────────────────────
            buildProduct("KONG Classic Chew Toy", "Durable natural rubber toy. Fill with treats or peanut butter to keep dogs busy for hours.",
                "KONG", 1499.0, 1199.0, "KNG-CLS-MED", 60,
                "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&q=80&w=400",
                "100% natural rubber",
                "Size: Medium (10-35kg dogs)|Dishwasher safe|Vet recommended",
                true, true, toys, seller),

            buildProduct("Feather Wand Cat Teaser", "Interactive feather wand toy to engage your cat's natural hunting instincts.",
                "PetLounge", 349.0, null, "PL-CAT-WAND-01", 150,
                "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=400",
                "Plastic wand, Natural feathers, Elastic cord",
                "Length: 60cm extended|Safe for cats of all ages|Feathers replaceable",
                true, false, toys, seller),

            buildProduct("Rope Chew Toy Set (3-pack)", "3 colorful braided cotton rope toys perfect for interactive play and dental health.",
                "BarkZone", 599.0, 449.0, "BZ-ROPE-3PK", 200,
                "https://images.unsplash.com/photo-1567612529009-afe35958e2f0?auto=format&fit=crop&q=80&w=400",
                "100% natural braided cotton",
                "Pack of 3|Sizes: Small, Medium, Large|Improves dental hygiene",
                true, false, toys, seller),

            buildProduct("Automatic Laser Cat Toy", "360° rotating automatic laser toy with 3 speed settings to entertain your cat.",
                "SmartPet", 1899.0, 1499.0, "SP-LASER-AUTO", 45,
                "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?auto=format&fit=crop&q=80&w=400",
                "ABS plastic, LED laser module",
                "3 speed modes|Auto shut-off after 15 mins|USB rechargeable",
                true, true, toys, seller),

            // ── Grooming ─────────────────────────────────────────────────────
            buildProduct("Himalaya Erina-EP Dog Shampoo", "Gentle herbal shampoo with neem and chickpea for healthy skin and coat.",
                "Himalaya", 299.0, 249.0, "HIM-SHP-ERINA-200ML", 300,
                "https://images.unsplash.com/photo-1527164153729-6abbee0c0938?auto=format&fit=crop&q=80&w=400",
                "Neem (Azadirachta indica), Chickpea (Cicer arietinum), Aloe vera",
                "Volume: 200ml|pH balanced|Vet recommended|All coat types",
                true, true, grooming, seller),

            buildProduct("FURminator Deshedding Brush", "Reduces shedding by up to 90%. Reaches through topcoat to remove loose undercoat hair.",
                "FURminator", 2999.0, 2499.0, "FRM-BRUSH-MED-SHORT", 35,
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400",
                "Stainless steel, ABS plastic, rubber grip",
                "Blade: 6.35cm|For medium dogs|Short hair (under 5cm)|FURejector button",
                true, true, grooming, seller),

            buildProduct("Pet Nail Clipper with Safety Guard", "Professional-grade nail clipper with built-in safety guard for safe, precise trimming.",
                "GoodBoy", 649.0, null, "GB-NAIL-CLIP-01", 180,
                "https://images.unsplash.com/photo-1589924691995-400dc9edfabb?auto=format&fit=crop&q=80&w=400",
                "Stainless steel blade, Non-slip rubber handle",
                "Safety stop guard|Sharp SS blade|For dogs & cats|Built-in nail file",
                true, false, grooming, seller),

            // ── Health & Wellness ─────────────────────────────────────────────
            buildProduct("Beaphar Vitamin C Supplement", "Daily multivitamin supplement for dogs and cats to support immunity and energy.",
                "Beaphar", 799.0, 649.0, "BEA-VIT-C-150TAB", 200,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Vitamin C, Vitamin E, Zinc, Biotin, Omega fatty acids",
                "150 tablets|Daily dose: 1 tablet|For dogs & cats 6 months+",
                true, true, health, seller),

            buildProduct("Tick & Flea Spot-On Treatment", "Monthly topical treatment that kills ticks and fleas within 48 hours of application.",
                "Frontline", 1199.0, null, "FL-SPOT-DOG-MED", 90,
                "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?auto=format&fit=crop&q=80&w=400",
                "Fipronil 9.8%, (S)-Methoprene 8.8%",
                "3 pipettes per pack|For dogs 10-20kg|Monthly application|Waterproof",
                true, false, health, seller),

            buildProduct("Petkin Dental Wipes (40-pack)", "Pre-moistened wipes for easy dental hygiene without brushing.",
                "Petkin", 449.0, 349.0, "PTK-DENTAL-40PK", 250,
                "https://images.unsplash.com/photo-1559214369-a6b1d7919865?auto=format&fit=crop&q=80&w=400",
                "Peppermint extract, Baking soda, Aloe vera, Purified water",
                "40 wipes per pack|Fresh mint flavour|For dogs & cats|No rinsing needed",
                true, false, health, seller),

            // ── Beds & Furniture ──────────────────────────────────────────────
            buildProduct("Orthopedic Memory Foam Dog Bed", "Therapeutic memory foam bed that relieves joint pain and pressure points for senior dogs.",
                "ComfyPaws", 3499.0, 2799.0, "CP-BED-ORTH-MED", 30,
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400",
                "Memory foam core, Microfibre cover",
                "Size: 80x60cm|Washable cover|Non-slip base|Ideal for senior dogs",
                true, true, beds, seller),

            buildProduct("Cat Tree Condo with Scratching Post", "5-level cat tree with cosy condo, multiple perches, and sisal scratching posts.",
                "Paws & Claws", 4999.0, 3999.0, "PC-TREE-5LVL", 15,
                "https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&q=80&w=400",
                "Particleboard, Sisal rope, Plush fabric",
                "Height: 150cm|Base: 50x50cm|Weight limit: 15kg|Easy assembly",
                true, true, beds, seller),

            buildProduct("Foldable Pet Travel Crate", "Lightweight foldable metal crate for safe car travel and home use.",
                "SafeTravel", 2199.0, null, "ST-CRATE-FOLD-MED", 40,
                "https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&q=80&w=400",
                "Powder-coated steel wire",
                "Dimensions: 76x48x53cm|Folds flat|Dual door|For dogs up to 25kg",
                true, false, beds, seller)
        );

        productRepository.saveAll(products);
    }

    // ─── Builder Helper ───────────────────────────────────────────────────────

    private Product buildProduct(String name, String description, String brand,
                                  Double price, Double discountPrice, String sku,
                                  int stock, String imageUrl,
                                  String ingredients, String specifications,
                                  boolean approved, boolean featured,
                                  Category category, User seller) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setBrand(brand);
        p.setPrice(price);
        p.setDiscountPrice(discountPrice);
        p.setSku(sku);
        p.setStockQuantity(stock);
        p.setImageUrl(imageUrl);
        p.setIngredients(ingredients);
        p.setSpecifications(specifications);
        p.setApproved(approved);
        p.setFeatured(featured);
        p.setAverageRating(0.0);
        p.setReviewCount(0);
        p.setCategory(category);
        p.setSeller(seller);
        return p;
    }
}
