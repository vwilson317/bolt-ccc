import { Barraca, CTAButtonConfig } from '../types';

// Extended types for premium retail business
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // in reais
  originalPrice?: number; // for sale items
  sku: string;
  brand: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  productId?: string; // if review is for specific product
  barracaId: string;
  helpfulVotes: number;
  createdAt: Date;
  response?: {
    content: string;
    respondedAt: Date;
    respondedBy: string;
  };
}

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  breaks?: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
}

export interface StoreLocation {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmarks: string[];
  parkingInfo: string;
  accessibilityInfo: string;
}

// Product Categories for Barraca Uruguay
export const productCategories: ProductCategory[] = [
  {
    id: 'cat-001',
    name: 'Beachwear',
    slug: 'beachwear',
    description: 'Premium swimwear and beach fashion',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'cat-002',
    name: 'Swimwear',
    slug: 'swimwear',
    description: 'High-quality bikinis, swimsuits, and board shorts',
    parentId: 'cat-001',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'cat-003',
    name: 'Cover-ups',
    slug: 'cover-ups',
    description: 'Elegant beach cover-ups and kaftans',
    parentId: 'cat-001',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'cat-004',
    name: 'Beach Accessories',
    slug: 'beach-accessories',
    description: 'Essential beach accessories and gear',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'cat-005',
    name: 'Sunglasses',
    slug: 'sunglasses',
    description: 'Designer and premium sunglasses',
    parentId: 'cat-004',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'cat-006',
    name: 'Beach Bags',
    slug: 'beach-bags',
    description: 'Stylish and functional beach bags',
    parentId: 'cat-004',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'cat-007',
    name: 'Sun Protection',
    slug: 'sun-protection',
    description: 'Premium sunscreens and sun protection products',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'cat-008',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Beach lifestyle and wellness products',
    sortOrder: 4,
    isActive: true
  }
];

// Product Inventory for Barraca Uruguay
export const productInventory: Product[] = [
  {
    id: 'prod-001',
    name: 'Ipanema Sunset Bikini',
    description: 'Luxurious Brazilian bikini inspired by Ipanema sunsets. Features adjustable straps and premium fabric with UV protection.',
    category: productCategories[1], // Swimwear
    price: 189.90,
    originalPrice: 249.90,
    sku: 'BU-BIK-001',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'
    ],
    inStock: true,
    stockQuantity: 15,
    tags: ['bikini', 'premium', 'uv-protection', 'adjustable', 'brazilian'],
    specifications: {
      'Material': '82% Polyamide, 18% Elastane',
      'UV Protection': 'UPF 50+',
      'Care Instructions': 'Hand wash cold, line dry',
      'Sizes Available': 'P, M, G, GG',
      'Origin': 'Made in Brazil'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'prod-002',
    name: 'Copacabana Classic One-Piece',
    description: 'Elegant one-piece swimsuit with sophisticated cut and premium Italian fabric. Perfect for the discerning beach lover.',
    category: productCategories[1], // Swimwear
    price: 299.90,
    sku: 'BU-SWM-002',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
      'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
    ],
    inStock: true,
    stockQuantity: 8,
    tags: ['one-piece', 'elegant', 'italian-fabric', 'premium', 'sophisticated'],
    specifications: {
      'Material': '85% Polyamide, 15% Elastane',
      'UV Protection': 'UPF 50+',
      'Care Instructions': 'Hand wash cold, do not bleach',
      'Sizes Available': 'P, M, G',
      'Origin': 'Italian fabric, assembled in Brazil'
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'prod-003',
    name: 'Rio Breeze Kaftan',
    description: 'Flowing silk kaftan perfect for beach-to-bar transitions. Features hand-embroidered details and premium silk blend.',
    category: productCategories[2], // Cover-ups
    price: 449.90,
    sku: 'BU-KAF-003',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    inStock: true,
    stockQuantity: 12,
    tags: ['kaftan', 'silk', 'hand-embroidered', 'versatile', 'luxury'],
    specifications: {
      'Material': '70% Silk, 30% Viscose',
      'Care Instructions': 'Dry clean only',
      'Sizes Available': 'Único (One Size)',
      'Length': '120cm',
      'Origin': 'Handcrafted in Brazil'
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'prod-004',
    name: 'Leblon Luxury Sunglasses',
    description: 'Premium polarized sunglasses with titanium frame. Offers 100% UV protection with sophisticated Brazilian design.',
    category: productCategories[4], // Sunglasses
    price: 599.90,
    sku: 'BU-SUN-004',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg',
      'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'
    ],
    inStock: true,
    stockQuantity: 6,
    tags: ['sunglasses', 'polarized', 'titanium', 'uv-protection', 'luxury'],
    specifications: {
      'Frame Material': 'Titanium',
      'Lens Type': 'Polarized CR-39',
      'UV Protection': '100% UV400',
      'Lens Width': '58mm',
      'Bridge Width': '18mm',
      'Temple Length': '140mm',
      'Origin': 'Designed in Brazil, made in Italy'
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'prod-005',
    name: 'Arpoador Beach Tote',
    description: 'Handwoven beach bag made from sustainable materials. Spacious design with waterproof lining and leather accents.',
    category: productCategories[5], // Beach Bags
    price: 329.90,
    sku: 'BU-BAG-005',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'
    ],
    inStock: true,
    stockQuantity: 10,
    tags: ['beach-bag', 'handwoven', 'sustainable', 'waterproof', 'leather'],
    specifications: {
      'Material': 'Sustainable raffia with leather accents',
      'Lining': 'Waterproof canvas',
      'Dimensions': '45cm x 35cm x 15cm',
      'Handle Drop': '25cm',
      'Care Instructions': 'Spot clean only',
      'Origin': 'Handcrafted in Brazil'
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'prod-006',
    name: 'Premium Mineral Sunscreen SPF 60',
    description: 'Reef-safe mineral sunscreen with zinc oxide and titanium dioxide. Water-resistant for 80 minutes.',
    category: productCategories[6], // Sun Protection
    price: 89.90,
    sku: 'BU-SUN-006',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
      'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
    ],
    inStock: true,
    stockQuantity: 25,
    tags: ['sunscreen', 'mineral', 'reef-safe', 'water-resistant', 'spf60'],
    specifications: {
      'SPF': '60',
      'Active Ingredients': 'Zinc Oxide 20%, Titanium Dioxide 6%',
      'Water Resistance': '80 minutes',
      'Volume': '100ml',
      'Reef Safe': 'Yes',
      'Cruelty Free': 'Yes',
      'Origin': 'Made in Brazil'
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod-007',
    name: 'Carioca Wellness Set',
    description: 'Complete wellness kit including organic coconut oil, sea salt scrub, and hydrating after-sun gel.',
    category: productCategories[7], // Lifestyle
    price: 159.90,
    originalPrice: 199.90,
    sku: 'BU-WEL-007',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    inStock: true,
    stockQuantity: 18,
    tags: ['wellness', 'organic', 'coconut-oil', 'sea-salt', 'after-sun'],
    specifications: {
      'Coconut Oil': '100ml organic virgin coconut oil',
      'Sea Salt Scrub': '200ml with Brazilian sea salt',
      'After-Sun Gel': '150ml with aloe vera and vitamin E',
      'Packaging': 'Eco-friendly bamboo box',
      'Certification': 'Organic certified',
      'Origin': 'Made in Brazil with local ingredients'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'prod-008',
    name: 'Bossa Nova Board Shorts',
    description: 'Premium men\'s board shorts with quick-dry technology and 4-way stretch. Perfect for surfing and beach volleyball.',
    category: productCategories[1], // Swimwear
    price: 219.90,
    sku: 'BU-BSH-008',
    brand: 'Barraca Uruguay',
    images: [
      'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg',
      'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'
    ],
    inStock: true,
    stockQuantity: 20,
    tags: ['board-shorts', 'quick-dry', '4-way-stretch', 'mens', 'surfing'],
    specifications: {
      'Material': '90% Polyester, 10% Elastane',
      'Technology': 'Quick-dry and 4-way stretch',
      'Inseam': '20 inches',
      'Waist': 'Adjustable drawstring',
      'Pockets': 'Back velcro pocket with key loop',
      'Sizes Available': 'P, M, G, GG, XGG',
      'Origin': 'Made in Brazil'
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-13')
  }
];

// Customer Reviews for Barraca Uruguay
export const customerReviews: CustomerReview[] = [
  {
    id: 'rev-001',
    customerId: 'cust-001',
    customerName: 'Marina Silva',
    customerAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    rating: 5,
    title: 'Qualidade excepcional!',
    content: 'Comprei o biquíni Ipanema Sunset e estou apaixonada! A qualidade do tecido é incrível e o caimento é perfeito. A proteção UV realmente funciona - passei o dia todo na praia sem me queimar. Vale cada centavo!',
    images: ['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
    isVerifiedPurchase: true,
    productId: 'prod-001',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 12,
    createdAt: new Date('2024-01-18'),
    response: {
      content: 'Muito obrigada pelo feedback, Marina! Ficamos felizes que você tenha gostado do produto. Esperamos vê-la em breve na nossa loja! 🌊',
      respondedAt: new Date('2024-01-19'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  },
  {
    id: 'rev-002',
    customerId: 'cust-002',
    customerName: 'Carlos Mendoza',
    customerAvatar: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg',
    rating: 5,
    title: 'Atendimento impecável',
    content: 'Loja incrível com produtos de altíssima qualidade. A equipe é super atenciosa e conhece muito bem os produtos. Comprei os óculos Leblon e estou muito satisfeito. Recomendo!',
    isVerifiedPurchase: true,
    productId: 'prod-004',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 8,
    createdAt: new Date('2024-01-16'),
    response: {
      content: 'Obrigada Carlos! Nosso time se dedica muito para oferecer a melhor experiência. Volte sempre! 😎',
      respondedAt: new Date('2024-01-17'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  },
  {
    id: 'rev-003',
    customerId: 'cust-003',
    customerName: 'Ana Beatriz',
    customerAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    rating: 4,
    title: 'Produtos lindos, preço justo',
    content: 'Adorei o kaftan Rio Breeze! O tecido é maravilhoso e os bordados são um luxo. Único ponto é que gostaria de mais opções de cores, mas a qualidade compensa.',
    isVerifiedPurchase: true,
    productId: 'prod-003',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 6,
    createdAt: new Date('2024-01-14'),
    response: {
      content: 'Oi Ana! Que bom que você gostou do kaftan! Vamos considerar sua sugestão para novas cores na próxima coleção. Obrigada! ✨',
      respondedAt: new Date('2024-01-15'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  },
  {
    id: 'rev-004',
    customerId: 'cust-004',
    customerName: 'Roberto Santos',
    customerAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    rating: 5,
    title: 'Melhor protetor solar que já usei',
    content: 'O protetor solar mineral é fantástico! Não deixa a pele oleosa e protege muito bem. Como surfista, preciso de proteção que dure e este produto entrega exatamente isso.',
    isVerifiedPurchase: true,
    productId: 'prod-006',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 15,
    createdAt: new Date('2024-01-12'),
    response: {
      content: 'Roberto, que alegria saber que nosso protetor está te acompanhando nas ondas! Proteção e performance são nossas prioridades. 🏄‍♂️',
      respondedAt: new Date('2024-01-13'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  },
  {
    id: 'rev-005',
    customerId: 'cust-005',
    customerName: 'Fernanda Costa',
    customerAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    rating: 5,
    title: 'Experiência completa',
    content: 'Não é só uma loja, é uma experiência! Desde o atendimento até a qualidade dos produtos, tudo é pensado nos mínimos detalhes. A bolsa Arpoador é linda e super funcional.',
    isVerifiedPurchase: true,
    productId: 'prod-005',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 10,
    createdAt: new Date('2024-01-10'),
    response: {
      content: 'Fernanda, seu comentário nos emociona! Trabalhamos com muito carinho para criar essa experiência única. Muito obrigada! 💙',
      respondedAt: new Date('2024-01-11'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  },
  {
    id: 'rev-006',
    customerId: 'cust-006',
    customerName: 'Lucas Oliveira',
    customerAvatar: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg',
    rating: 4,
    title: 'Board shorts de qualidade',
    content: 'Comprei o board shorts Bossa Nova e estou muito satisfeito. O tecido seca rápido e é confortável para praticar esportes. Recomendo para quem busca qualidade.',
    isVerifiedPurchase: true,
    productId: 'prod-008',
    barracaId: 'barraca-uruguay',
    helpfulVotes: 7,
    createdAt: new Date('2024-01-08'),
    response: {
      content: 'Lucas, obrigada pelo feedback! Nossos board shorts são desenvolvidos pensando no conforto e performance dos atletas. 🏐',
      respondedAt: new Date('2024-01-09'),
      respondedBy: 'Equipe Barraca Uruguay'
    }
  }
];

// Business Hours for Barraca Uruguay
export const businessHours: BusinessHours[] = [
  {
    dayOfWeek: 0, // Sunday
    isOpen: true,
    openTime: '10:00',
    closeTime: '18:00'
  },
  {
    dayOfWeek: 1, // Monday
    isOpen: true,
    openTime: '09:00',
    closeTime: '19:00',
    breaks: [
      {
        startTime: '12:30',
        endTime: '13:30',
        reason: 'Lunch break'
      }
    ]
  },
  {
    dayOfWeek: 2, // Tuesday
    isOpen: true,
    openTime: '09:00',
    closeTime: '19:00',
    breaks: [
      {
        startTime: '12:30',
        endTime: '13:30',
        reason: 'Lunch break'
      }
    ]
  },
  {
    dayOfWeek: 3, // Wednesday
    isOpen: true,
    openTime: '09:00',
    closeTime: '19:00',
    breaks: [
      {
        startTime: '12:30',
        endTime: '13:30',
        reason: 'Lunch break'
      }
    ]
  },
  {
    dayOfWeek: 4, // Thursday
    isOpen: true,
    openTime: '09:00',
    closeTime: '19:00',
    breaks: [
      {
        startTime: '12:30',
        endTime: '13:30',
        reason: 'Lunch break'
      }
    ]
  },
  {
    dayOfWeek: 5, // Friday
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    breaks: [
      {
        startTime: '12:30',
        endTime: '13:30',
        reason: 'Lunch break'
      }
    ]
  },
  {
    dayOfWeek: 6, // Saturday
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00'
  }
];

// Store Location Details
export const storeLocation: StoreLocation = {
  address: 'Rua Visconde de Pirajá, 351 - Loja 203',
  neighborhood: 'Ipanema',
  city: 'Rio de Janeiro',
  state: 'RJ',
  postalCode: '22410-003',
  country: 'Brasil',
  coordinates: {
    lat: -22.9838,
    lng: -43.2096
  },
  landmarks: [
    'Em frente à Estação de Metrô General Osório',
    'Próximo ao Shopping Leblon',
    'A 2 quadras da Praia de Ipanema',
    'Ao lado da Livraria Argumento'
  ],
  parkingInfo: 'Estacionamento pago disponível no subsolo do edifício. Vagas limitadas para clientes.',
  accessibilityInfo: 'Loja com acesso para cadeirantes. Elevador disponível. Provador adaptado.'
};

// Custom CTA Buttons for Barraca Uruguay
const barracaUruguayCTAButtons: CTAButtonConfig[] = [
  {
    id: 'shop-online',
    text: 'Loja Online',
    action: {
      type: 'url',
      value: 'https://barracauruguay.com.br/loja',
      target: '_blank',
      trackingEvent: 'online_store_clicked'
    },
    style: 'primary',
    position: 1,
    visibilityConditions: {},
    icon: 'ExternalLink',
    enabled: true
  },
  {
    id: 'whatsapp-catalog',
    text: 'Catálogo',
    action: {
      type: 'whatsapp',
      value: '+55 21 99237-1601',
      trackingEvent: 'whatsapp_catalog_clicked'
    },
    style: 'secondary',
    position: 2,
    visibilityConditions: {
      timeRestrictions: {
        startTime: '09:00',
        endTime: '19:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6] // Monday to Saturday
      }
    },
    icon: 'MessageCircle',
    enabled: true
  },
  {
    id: 'store-location',
    text: 'Localização',
    action: {
      type: 'url',
      value: 'https://maps.google.com/?q=-22.9838,-43.2096',
      target: '_blank',
      trackingEvent: 'store_location_clicked'
    },
    style: 'outline',
    position: 3,
    visibilityConditions: {},
    icon: 'MapPin',
    enabled: true
  },
  {
    id: 'personal-shopper',
    text: 'Personal Shopper',
    action: {
      type: 'whatsapp',
      value: '+55 21 99237-1601',
      trackingEvent: 'personal_shopper_clicked'
    },
    style: 'ghost',
    position: 4,
    visibilityConditions: {
      requiresOpen: true,
      memberOnly: true
    },
    icon: 'Star',
    enabled: true
  }
];

// Main Barraca Uruguay Data
export const barracaUruguayData: Barraca = {
  id: 'barraca-uruguay',
  name: 'Barraca Uruguay',
  barracaNumber: '203',
  location: 'Ipanema',
  coordinates: {
    lat: -22.9838,
    lng: -43.2096
  },
  isOpen: true,
  typicalHours: '09:00 - 19:00',
  description: 'Premium beachwear boutique offering curated selection of high-quality swimwear, beach accessories, and lifestyle products. Specializing in Brazilian beach fashion with international quality standards.',
  images: [
    'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
    'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg',
    'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
    'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
  ],
  menuPreview: [
    'Premium Swimwear',
    'Designer Sunglasses', 
    'Beach Accessories',
    'Sun Protection',
    'Lifestyle Products'
  ],
  contact: {
    phone: '+55 21 99237-1601',
    email: 'contato@barracauruguay.com.br',
    website: 'https://instagram.com/barraca_uruguay'
  },
  amenities: [
    'Personal Shopper',
    'Gift Wrapping',
    'Size Consultation',
    'Product Customization',
    'VIP Fitting Room',
    'Delivery Service',
    'Loyalty Program',
    'Style Advisory'
  ],
  weatherDependent: false,
  createdAt: new Date('2023-06-15'),
  updatedAt: new Date('2024-01-20'),
  ctaButtons: barracaUruguayCTAButtons
};

// Database Indexes for Performance (PostgreSQL example)
export const databaseIndexes = {
  products: [
    'CREATE INDEX idx_products_category_id ON products(category_id);',
    'CREATE INDEX idx_products_brand ON products(brand);',
    'CREATE INDEX idx_products_price ON products(price);',
    'CREATE INDEX idx_products_in_stock ON products(in_stock);',
    'CREATE INDEX idx_products_created_at ON products(created_at);',
    'CREATE INDEX idx_products_tags ON products USING GIN(tags);',
    'CREATE INDEX idx_products_search ON products USING GIN(to_tsvector(\'portuguese\', name || \' \' || description));'
  ],
  reviews: [
    'CREATE INDEX idx_reviews_barraca_id ON reviews(barraca_id);',
    'CREATE INDEX idx_reviews_product_id ON reviews(product_id);',
    'CREATE INDEX idx_reviews_rating ON reviews(rating);',
    'CREATE INDEX idx_reviews_created_at ON reviews(created_at);',
    'CREATE INDEX idx_reviews_verified_purchase ON reviews(is_verified_purchase);'
  ],
  categories: [
    'CREATE INDEX idx_categories_parent_id ON categories(parent_id);',
    'CREATE INDEX idx_categories_sort_order ON categories(sort_order);',
    'CREATE INDEX idx_categories_active ON categories(is_active);'
  ]
};

// Foreign Key Relationships
export const foreignKeyConstraints = {
  products: [
    'ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id);'
  ],
  reviews: [
    'ALTER TABLE reviews ADD CONSTRAINT fk_reviews_barraca FOREIGN KEY (barraca_id) REFERENCES barracas(id);',
    'ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id);'
  ],
  categories: [
    'ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id);'
  ]
};

// Business Analytics Data
export const businessMetrics = {
  averageRating: 4.8,
  totalReviews: customerReviews.length,
  totalProducts: productInventory.length,
  averageOrderValue: 245.50,
  conversionRate: 0.12,
  returnCustomerRate: 0.68,
  monthlyRevenue: 125000.00,
  topSellingCategories: [
    { categoryId: 'cat-002', name: 'Swimwear', salesPercentage: 35 },
    { categoryId: 'cat-005', name: 'Sunglasses', salesPercentage: 25 },
    { categoryId: 'cat-006', name: 'Beach Bags', salesPercentage: 20 },
    { categoryId: 'cat-007', name: 'Sun Protection', salesPercentage: 20 }
  ]
};

export default {
  barraca: barracaUruguayData,
  products: productInventory,
  categories: productCategories,
  reviews: customerReviews,
  businessHours,
  storeLocation,
  businessMetrics,
  databaseIndexes,
  foreignKeyConstraints
};