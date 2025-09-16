import { BarracaMenu, MenuLanguage, MenuSection } from '../types/menu';

// Simple parser for our constrained markdown tables used in menu-82-pt.md and menu-82-en.md
function parseMarkdownToSections(md: string): MenuSection[] {
  const lines = md.split(/\r?\n/);
  const sections: MenuSection[] = [];
  let currentTitle: string | null = null;
  let currentItems: { name: string; size?: string; price?: string; note?: string }[] = [];
  let inTable = false;

  const flushSection = () => {
    if (currentTitle && currentItems.length > 0) {
      sections.push({ title: currentTitle, items: currentItems });
    }
    currentTitle = null;
    currentItems = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Section title like ## Drinks
    if (line.startsWith('## ')) {
      flushSection();
      currentTitle = line.replace(/^##\s+/, '').trim();
      continue;
    }

    // Start of table header line: | col | col |
    if (line.startsWith('|') && line.endsWith('|')) {
      // The next line might be separator ---; detect header by presence of '----'
      if (!inTable) {
        inTable = true;
        // skip header and separator lines
        // header at i, separator at i+1 -> advance i by 1 extra
        if (i + 1 < lines.length && lines[i + 1].includes('---')) {
          i += 1;
        }
        continue;
      }

      // Table row
      const cols = line
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());

      if (cols.length === 2) {
        const [name, price] = cols;
        currentItems.push({ name, price });
      } else if (cols.length === 3) {
        const [name, size, price] = cols;
        currentItems.push({ name, size, price });
      }
      continue;
    }

    // Bulleted lists under special sections (e.g., Special Drinks Menu)
    if (line.startsWith('- ')) {
      const content = line.replace(/^-\s*/, '');
      currentItems.push({ name: content });
      continue;
    }
  }

  flushSection();
  return sections;
}

// Inline the markdown as raw strings to avoid runtime fetch for now
const MENU_82_EN_MD = `# Bar 82 - Drink More Water

## Rentals
| Item | Price (R$) |
|----------------|------------|
| Chair | 10,00 |
| Umbrella P | 20,00 |
| Umbrella M | 30,00 |
| Parasol (Large Umbrella) | 50,00 |

---

## Drinks
| Item | Price (R$) |
|----------------------|------------|
| Coconut water | 10,00 |
| Bottled water | 6,00 |
| Sparkling water | 8,00 |
| Coca-Cola / Soda | 8,00 |
| Guaraná | 8,00 |
| Natural Guaraná (Guaraviton) | 8,00 |

---

## Beer
| Brand | Price (R$) |
|------------------------|------------|
| Brahma / Antarctica | 12,00 |
| Heineken | 15,00 |
| Corona / Stella | 15,00 |
| Amstel | 12,00 |

---

## Cocktails
| Drink | Size | Price (R$) |
|--------------------------|------|------------|
| Caipirinha (Cachaça 51) | 500ml | 25,00 |
|  | 700ml | - |
| Caipvodka (Smirnoff) | 500ml | 30,00 |
|  | 700ml | - |
| Smirnoff (Ready 500ml) | - | 30,00 |
| Gin Tonic / Mojito / Cuba Libre | - | - |

---

## Natural Juice
| Size | Price (R$) |
|-------|------------|
| 500ml | 20,00 |
| 700ml | - |

---

# Special Drinks Menu

## Caipirinha (Cachaça 51) - R$ 25,00
- Fruits: Strawberry, Lime, Grape, Passion Fruit, Pineapple, Kiwi, Tangerine  
- Customize: Up to 2 fruits of your choice  
- 3 flavors + R$ 5,00 (extra)  
- Free herbs: Rosemary, Mint  

## Caipvodka (Smirnoff) - R$ 30,00
- Same fruit options as Caipirinha  
- Same customization rules  

## Gin - R$ 30,00
- Fruits: Strawberry, Lime, Grape, Passion Fruit, Pineapple, Kiwi, Tangerine  
- Extra: Red Bull + R$ 15,00  

---

## Drinkole
- Step-by-step:
  - Choose 2 popsicle (sacolé) flavors  
  - Choose a base: Cachaça 51, Gin, Smirnoff Vodka  
- Suggested combos:
  - Lime + Strawberry  
  - Lime + Passion Fruit  
  - Strawberry + Passion Fruit  
  - Caipirinha  
  - Caipirinha + Corona  

---

## Batidas / Milkshakes
- Coconut with Strawberry  
- Coconut Delight  
- Passion Fruit Mousse  
- Strawberry Mousse  
- Alpino Chocolate  
- Prestígio  
- Sensação  
`;

const MENU_82_PT_MD = `# Bar 82 - Drink More Water

## Rentals
| Item           | Price (R$) |
|----------------|------------|
| Chair (Cadeira / Silla)        | 10,00 |
| Umbrella P (Guarda-Sol P / Quitasol P) | 20,00 |
| Umbrella M (Guarda-Sol M / Quitasol M) | 30,00 |
| Umbrella (Ombrelone / Paraguas)        | 50,00 |

---

## Drinks (Bebidas)
| Item                 | Price (R$) |
|----------------------|------------|
| Coconut water (Água de coco)   | 10,00 |
| Bottled water (Água mineral)   | 6,00 |
| Sparkling water (Água com gás) | 8,00 |
| Coca-Cola / Soda               | 8,00 |
| Guaraná                        | 8,00 |
| Guarana Natural (Guaraviton)   | 8,00 |

---

## Beer (Cerveja)
| Brand                  | Price (R$) |
|------------------------|------------|
| Brahma / Antarctica    | 12,00 |
| Heineken               | 15,00 |
| Corona / Stella        | 15,00 |
| Amstel                 | 12,00 |

---

## Cocktails
| Drink                   | Size | Price (R$) |
|--------------------------|------|------------|
| Caipirinha (Cachaça 51)  | 500ml | 25,00 |
|                          | 700ml | - |
| Caipvodka (Smirnoff)     | 500ml | 30,00 |
|                          | 700ml | - |
| Smirnoff (500ml)         | -     | 30,00 |
| Gin Tonic / Mojito / Cuba Libre | - | - |

---

## Fruit Juice (Suco Natural / Jugo Natural)
| Size  | Price (R$) |
|-------|------------|
| 500ml | 20,00 |
| 700ml | - |

---

# Special Drinks Menu

## Caipirinha (Cachaça 51) - R$ 25,00
- Fruits: Morango, Limão, Uva, Maracujá, Abacaxi, Kiwi, Tangerina  
- Customize: Up to 2 fruits of choice  
- 3 flavors + R$ 5,00 (extra)  
- Free herbs: Alecrim, Hortelã  

## Caipvodka (Smirnoff) - R$ 30,00
- Same fruit options as Caipirinha  
- Same customization rules  

## Gin - R$ 30,00
- Fruits: Morango, Limão, Uva, Maracujá, Abacaxi, Kiwi, Tangerina  
- Extra: Red Bull + R$ 15,00  

---

## Drinkole
- Step-by-step:
  - Choose 2 sacolé flavors  
  - Choose base: Cachaça 51, Gin, Vodka Smirnoff  
- Suggested combos:
  - Limão + Morango  
  - Limão + Maracujá  
  - Morango + Maracujá  
  - Caipirinha  
  - Caipirinha + Corona  

---

## Batidas / Milkshakes
- Coco com Morango  
- Delícia de Coco  
- Mousse de Maracujá  
- Mousse de Morango  
- Chocolate Alpino  
- Prestígio  
- Sensação  
`;

export class MenuService {
  // Mock: only barraca 82 supported for now
  static async getMenuForBarraca(barracaId: string, language: MenuLanguage = 'en'): Promise<BarracaMenu | null> {
    if (barracaId !== 'f86c49e6-6c44-4ce8-a455-a981042f4512') return null;

    const md = (language === 'en' ? MENU_82_EN_MD : MENU_82_PT_MD) || MENU_82_PT_MD;
    const lang: MenuLanguage = (language === 'en' && MENU_82_EN_MD) ? 'en' : 'pt';

    const sections = parseMarkdownToSections(md);
    return {
      barracaId,
      language: lang,
      sections,
      rawMd: md,
    };
  }

  // Common menu preview items to display as cards for all barracas
  static getCommonMenuPreview(language: MenuLanguage = 'en'): string[] {
    const en = [
      'Caipirinha',
      'Coconut Water',
      'Heineken',
      'Corona',
      'Guaraná',
      'Natural Juice 500ml',
      'Caipvodka',
      'Gin Tonic',
      'Batida Milkshake',
    ];
    const pt = [
      'Caipirinha',
      'Água de Coco',
      'Heineken',
      'Corona',
      'Guaraná',
      'Suco Natural 500ml',
      'Caipvodka',
      'Gin Tônica',
      'Batida Milkshake',
    ];
    return language === 'pt' ? pt : en;
  }
}


