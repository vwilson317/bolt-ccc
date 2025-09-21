export type MenuLanguage = 'en' | 'pt';

export interface MenuItem {
  name: string;
  size?: string;
  price?: string; // Keep as string to preserve formatting like 10,00
  note?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface BarracaMenu {
  barracaId: string;
  language: MenuLanguage;
  sections: MenuSection[];
  rawMd?: string;
}


