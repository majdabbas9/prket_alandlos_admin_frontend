export type WoodType = 'Oak' | 'Walnut' | 'Herringbone' | 'Chevron';
export type Finish = 'Brushed' | 'Matt' | 'Glossy';

export interface Product {
  id: string;
  name: string;
  woodType: WoodType;
  finish: Finish;
  thickness: string;
  plankSize: string;
  description: string;
  pricePerSqm: number;
  image: string;
  tag?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'rustic-brushed-oak',
    name: 'Rustic Brushed Oak',
    woodType: 'Oak',
    finish: 'Brushed',
    thickness: '14 mm',
    plankSize: '180 × 2200 mm',
    description:
      'Character-grade European oak with a hand-brushed surface that highlights the natural grain and knots. A warm, lived-in finish that ages beautifully.',
    pricePerSqm: 89,
    image:
      'https://images.pexels.com/photos/6364752/pexels-photo-6364752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Bestseller',
  },
  {
    id: 'natural-matt-oak',
    name: 'Natural Matt Oak',
    woodType: 'Oak',
    finish: 'Matt',
    thickness: '15 mm',
    plankSize: '200 × 2400 mm',
    description:
      'A clean, pale oak with a velvety matt lacquer. Soft to the touch and exceptionally forgiving in bright, sunlit rooms.',
    pricePerSqm: 95,
    image:
      'https://images.pexels.com/photos/314072/pexels-photo-314072.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'glossy-premium-oak',
    name: 'Glossy Premium Oak',
    woodType: 'Oak',
    finish: 'Glossy',
    thickness: '14 mm',
    plankSize: '180 × 1860 mm',
    description:
      'A polished, high-sheen oak that catches the light and enlarges any space. Sealed with a durable UV-cured gloss lacquer.',
    pricePerSqm: 102,
    image:
      'https://images.pexels.com/photos/314071/pexels-photo-314071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'smoked-brushed-walnut',
    name: 'Smoked Brushed Walnut',
    woodType: 'Walnut',
    finish: 'Brushed',
    thickness: '15 mm',
    plankSize: '190 × 1900 mm',
    description:
      'Rich American walnut, smoked to deepen the chocolate tones and brushed for texture. A statement floor for formal interiors.',
    pricePerSqm: 134,
    image:
      'https://images.pexels.com/photos/8337527/pexels-photo-8337527.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Premium',
  },
  {
    id: 'midnight-matt-walnut',
    name: 'Midnight Matt Walnut',
    woodType: 'Walnut',
    finish: 'Matt',
    thickness: '14 mm',
    plankSize: '180 × 2000 mm',
    description:
      'Dark, dramatic walnut with a soft matt finish that absorbs light for a calm, contemporary feel underfoot.',
    pricePerSqm: 128,
    image:
      'https://images.pexels.com/photos/8465898/pexels-photo-8465898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'classic-herringbone-oak',
    name: 'Classic Herringbone Oak',
    woodType: 'Herringbone',
    finish: 'Brushed',
    thickness: '15 mm',
    plankSize: '120 × 600 mm',
    description:
      'The timeless herringbone pattern in brushed oak. Geometric elegance that adds movement and heritage to any room.',
    pricePerSqm: 119,
    image:
      'https://images.pexels.com/photos/15066939/pexels-photo-15066939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Signature',
  },
  {
    id: 'glossy-herringbone-oak',
    name: 'Glossy Herringbone Oak',
    woodType: 'Herringbone',
    finish: 'Glossy',
    thickness: '14 mm',
    plankSize: '100 × 500 mm',
    description:
      'Herringbone with a reflective gloss lacquer — a refined, light-filled finish for entrance halls and formal living spaces.',
    pricePerSqm: 126,
    image:
      'https://images.pexels.com/photos/7587861/pexels-photo-7587861.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'french-chevron-walnut',
    name: 'French Chevron Walnut',
    woodType: 'Chevron',
    finish: 'Matt',
    thickness: '15 mm',
    plankSize: '90 × 450 mm',
    description:
      'A sharp 60° chevron cut in matt walnut. The pointed geometry creates a continuous flow that elongates any interior.',
    pricePerSqm: 142,
    image:
      'https://images.pexels.com/photos/7166928/pexels-photo-7166928.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tag: 'Premium',
  },
  {
    id: 'brushed-chevron-oak',
    name: 'Brushed Chevron Oak',
    woodType: 'Chevron',
    finish: 'Brushed',
    thickness: '15 mm',
    plankSize: '95 × 500 mm',
    description:
      'Chevron-laid oak with a textured brushed surface. A contemporary take on a classic Parisian apartment floor.',
    pricePerSqm: 131,
    image:
      'https://images.pexels.com/photos/8146214/pexels-photo-8146214.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export const WOOD_TYPES: WoodType[] = ['Oak', 'Walnut', 'Herringbone', 'Chevron'];
export const FINISHES: Finish[] = ['Brushed', 'Matt', 'Glossy'];
