import { Product } from "@/types";

export const demoProducts: Product[] = [
  {
    id: "prod_single_sunny",
    slug: "single-sunny",
    name: "Single Sunny",
    tagline: "The original raised cedar planter — room to grow everything you need.",
    description:
      "The Single Sunny is our flagship planter box. At five feet wide and two feet tall, it offers a generous 18 inches of planting depth — enough for deep-rooted vegetables, herbs, and flowers alike. Built with western red cedar using traditional frame-and-panel joinery, every Single Sunny is handcrafted to last season after season. The open planting bay gives you complete freedom to design your garden layout, whether you're growing a kitchen herb garden or a full row of tomatoes.",
    width: "5 ft",
    height: "2 ft",
    plantingDepth: "18 inches",
    numRows: 1,
    configuration: "One open planting bay",
    priceNoLegs: 50900,
    priceWithLegs: 62400,
    visible: true,
    sortOrder: 1,
    photos: [
      {
        id: "photo_single_1",
        url: "/images/products/single-sunny-1.jpg",
        alt: "Single Sunny cedar planter box in a garden setting",
        sortOrder: 0,
      },
      {
        id: "photo_single_2",
        url: "/images/products/single-sunny-2.jpg",
        alt: "Single Sunny cedar planter box detail view",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "prod_tiny_sunny",
    slug: "tiny-sunny",
    name: "Tiny Sunny",
    tagline: "Compact cedar planter — perfect for patios, porches, and small spaces.",
    description:
      "The Tiny Sunny brings everything we love about cedar planting into a compact footprint. At two feet wide and two feet tall with the same generous 18-inch planting depth, it's ideal for patios, balconies, porches, or any space where a full-size planter won't fit. Despite its smaller frame, the Tiny Sunny offers serious growing capacity. Use it for a focused herb collection, a single statement plant, or a tightly curated mix of flowers. Same handcrafted cedar construction, same attention to detail — just sized for life's cozier corners.",
    width: "2 ft",
    height: "2 ft",
    plantingDepth: "18 inches",
    numRows: 1,
    configuration: "One open planting bay",
    priceNoLegs: 28100,
    priceWithLegs: 34500,
    visible: true,
    sortOrder: 2,
    photos: [
      {
        id: "photo_tiny_1",
        url: "/images/products/tiny-sunny-1.jpg",
        alt: "Tiny Sunny cedar planter box on a patio",
        sortOrder: 0,
      },
      {
        id: "photo_tiny_2",
        url: "/images/products/tiny-sunny-2.jpg",
        alt: "Tiny Sunny cedar planter box with herbs",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "prod_double_sunny",
    slug: "double-sunny",
    name: "Double Sunny",
    tagline: "Two tiers of planting — double the growing space in one beautiful frame.",
    description:
      "The Double Sunny takes the Single Sunny's footprint and doubles your growing potential with two stacked planting bays. Each row offers 8 inches of planting depth — ideal for herbs, lettuces, strawberries, and shallow-rooted flowers. The two tiers are joined at all four corners by continuous cedar posts, with open air between the rows for light and airflow. The result is a striking vertical garden that produces twice the harvest without taking up any extra ground space. Perfect for gardeners who want to maximize a sunny wall or fence line.",
    width: "5 ft",
    height: "3 ft",
    plantingDepth: "8 inches per row",
    numRows: 2,
    configuration: "Two stacked planting bays joined by continuous cedar posts",
    priceNoLegs: 62900,
    priceWithLegs: 74300,
    visible: true,
    sortOrder: 3,
    photos: [
      {
        id: "photo_double_1",
        url: "/images/products/double-sunny-1.jpg",
        alt: "Double Sunny two-tier cedar planter box",
        sortOrder: 0,
      },
      {
        id: "photo_double_2",
        url: "/images/products/double-sunny-2.jpg",
        alt: "Double Sunny cedar planter box with plants growing",
        sortOrder: 1,
      },
    ],
  },
];
