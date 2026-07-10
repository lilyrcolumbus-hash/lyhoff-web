import type { Locale } from "./i18n";

export interface QuizOption {
  label: Record<Locale, string>;
  next?: string; // next node id
  result?: string; // product slug
}

export interface QuizNode {
  id: string;
  question: Record<Locale, string>;
  options: QuizOption[];
}

export const quizNodes: QuizNode[] = [
  {
    id: "root",
    question: {
      en: "What are you here for?",
      es: "¿Qué estás buscando?",
    },
    options: [
      {
        label: { en: "Skin & body care", es: "Piel y cuerpo" },
        next: "bodycare",
      },
      {
        label: { en: "Hair care", es: "Cuidado capilar" },
        next: "hair",
      },
      {
        label: { en: "Home & garden", es: "Hogar y jardín" },
        result: "hummingbird-nectar",
      },
      {
        label: { en: "Health & wellness", es: "Salud y bienestar" },
        result: "methylene-blue",
      },
    ],
  },
  {
    id: "bodycare",
    question: {
      en: "What's your main focus?",
      es: "¿Cuál es tu enfoque principal?",
    },
    options: [
      {
        label: { en: "Daily moisture, all over", es: "Hidratación diaria, en todo el cuerpo" },
        result: "tallow-cream-2oz",
      },
      {
        label: { en: "The same, but a bigger jar", es: "Lo mismo, pero en frasco más grande" },
        result: "tallow-cream-4oz",
      },
      {
        label: { en: "Joint, muscle, or targeted relief", es: "Alivio de articulaciones, músculos o zonas específicas" },
        result: "comfrey-salve",
      },
    ],
  },
  {
    id: "hair",
    question: {
      en: "What's your hair goal?",
      es: "¿Cuál es tu meta capilar?",
    },
    options: [
      {
        label: { en: "Stronger roots, visible growth", es: "Raíces más fuertes, crecimiento visible" },
        result: "hair-growth-oil",
      },
      {
        label: { en: "Texture & volume", es: "Textura y volumen" },
        result: "sea-salt-spray",
      },
    ],
  },
];

export const getQuizNode = (id: string) => quizNodes.find((n) => n.id === id);
