import { property, SpecialSquare } from './Property.ts';
import type { Square } from './Property.ts'

export const monopolyBoard: Square[] = [
    /* 00 */ new SpecialSquare(0, "Départ", "start"),
    /* 01 */ new property(1, "Boulevard de Belleville", "property", 50, [2, 10, 30, 90, 160, 250], 60, "brown"),
    /* 02 */ new SpecialSquare(2, "Caisse de Communauté", "community"),
    /* 03 */ new property(3, "Rue Lecourbe", "property", 50, [4, 20, 60, 180, 320, 450], 60, "brown"),
    /* 04 */ new SpecialSquare(4, "Impôts sur le revenu", "tax"),
    /* 05 */ new property(5, "Gare Montparnasse", "station", 0, [25, 50, 100, 200], 200, ""),
    /* 06 */ new property(6, "Rue de Vaugirard", "property", 50, [6, 30, 90, 270, 400, 550], 100, "cyan"),
    /* 07 */ new SpecialSquare(7, "Chance", "chance"),
    /* 08 */ new property(8, "Rue de Courcelles", "property", 50, [6, 30, 90, 270, 400, 550], 100, "cyan"),
    /* 09 */ new property(9, "Avenue de la République", "property", 50, [8, 40, 100, 300, 450, 600], 120, "cyan"),
    
    /* 10 */ new SpecialSquare(10, "Simple Visite / Prison", "jail"),
    /* 11 */ new property(11, "Boulevard de la Villette", "property", 100, [10, 50, 150, 450, 625, 750], 140, "pink"),
    /* 12 */ new property(12, "Compagnie de Distribution d'Électricité", "utility", 0, [4, 10], 150, ""),
    /* 13 */ new property(13, "Avenue de Neuilly", "property", 100, [10, 50, 150, 450, 625, 750], 140, "pink"),
    /* 14 */ new property(14, "Rue de Paradis", "property", 100, [12, 60, 180, 500, 700, 900], 160, "pink"),
    /* 15 */ new property(15, "Gare de Lyon", "station", 0, [25, 50, 100, 200], 200, ""),
    /* 16 */ new property(16, "Avenue Mozart", "property", 100, [14, 70, 200, 550, 750, 950], 180, "orange"),
    /* 17 */ new SpecialSquare(17, "Caisse de Communauté", "community"),
    /* 18 */ new property(18, "Boulevard Saint-Michel", "property", 100, [14, 70, 200, 550, 750, 950], 180, "orange"),
    /* 19 */ new property(19, "Place Pigalle", "property", 100, [16, 80, 220, 600, 800, 1000], 200, "orange"),
    
    /* 20 */ new SpecialSquare(20, "Parc Gratuit", "parking"),
    /* 21 */ new property(21, "Avenue Matignon", "property", 150, [18, 90, 250, 700, 875, 1050], 220, "red"),
    /* 22 */ new SpecialSquare(22, "Chance", "chance"),
    /* 23 */ new property(23, "Boulevard Malesherbes", "property", 150, [18, 90, 250, 700, 875, 1050], 220, "red"),
    /* 24 */ new property(24, "Avenue Henri-Martin", "property", 150, [20, 100, 300, 750, 925, 1100], 240, "red"),
    /* 25 */ new property(25, "Gare du Nord", "station", 0, [25, 50, 100, 200], 200, ""),
    /* 26 */ new property(26, "Faubourg Saint-Honoré", "property", 150, [22, 110, 330, 800, 975, 1150], 260, "yellow"),
    /* 27 */ new property(27, "Place de la Bourse", "property", 150, [22, 110, 330, 800, 975, 1150], 260, "yellow"),
    /* 28 */ new property(28, "Compagnie de Distribution des Eaux", "utility", 0, [4, 10], 150, ""),
    /* 29 */ new property(29, "Avenue de la République", "property", 150, [24, 120, 360, 850, 1025, 1200], 280, "yellow"),
    
    /* 30 */ new SpecialSquare(30, "Allez en Prison", "go-to-jail"),
    /* 31 */ new property(31, "Avenue de Bréteuil", "property", 200, [26, 130, 390, 900, 1100, 1275], 300, "green"),
    /* 32 */ new property(32, "Avenue Foch", "property", 200, [26, 130, 390, 900, 1100, 1275], 300, "green"),
    /* 33 */ new SpecialSquare(33, "Caisse de Communauté", "community"),
    /* 34 */ new property(34, "Avenue de Capucines", "property", 200, [28, 150, 450, 1000, 1200, 1400], 320, "green"),
    /* 35 */ new property(35, "Gare Saint-Lazare", "station", 0, [25, 50, 100, 200], 200, ""),
    /* 36 */ new SpecialSquare(36, "Chance", "chance"),
    /* 37 */ new property(37, "Avenue des Champs-Élysées", "property", 200, [35, 175, 500, 1100, 1300, 1500], 350, "blue"),
    /* 38 */ new SpecialSquare(38, "Taxe de Luxe", "tax"),
    /* 39 */ new property(39, "Rue de la Paix", "property", 200, [50, 200, 600, 1400, 1700, 2000], 400, "blue")
];
