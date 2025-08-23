import { db, getDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { expect, test } from 'vitest';
import { calculateOrderPrice } from '/js/FormModel.js';

const fs = require('fs');

const birdSpeciesData = fs.readFileSync('public/js/tests/testData/bird_species_pricing.json');
const birdSpecies = JSON.parse(birdSpeciesData);

const postcodePrice = fs.readFileSync('public/js/tests/testData/postcode_price_definitions.json');
const pricePostcodeDefinitions= JSON.parse(postcodePrice);
// const pricePostcodeDefinitions = pricePostcodeDefinitionsJSON[''];

const birdSpeciesSet = new Set();

for(let i = 0; i < birdSpecies.species.length; i++){

  birdSpeciesSet.add(birdSpecies.species[i].name);

}   

//calculateOrderPrice(collectionPostcodeInput, deliveryPostcodeInput, quantityInput, animalTypeInput, birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)

describe('Order Price Calculation', () => {

  describe('Young Pigeons', () => {
    test('should calculate correct price for 12 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 12, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });

    test('should calculate correct price for 13 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 13, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(57);
    });
    
    test('should calculate correct price for 1 young pigeon', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });
    
    test('should calculate correct price for 22 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 22, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
    });
  });

  describe('Old Pigeons', () => {
   test('should calculate correct price for 12 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });

    test('should calculate correct price for 13 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 13, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(57);
    });
    
    test('should calculate correct price for 1 young pigeon', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });
    
    test('should calculate correct price for 22 young pigeons', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 22, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
    });
  });

  describe('Postcode Surcharges', () => {
    test('should calculate correct price for a London collection postcode (Old Birds)', () => {
      expect(calculateOrderPrice("TW7 6NY", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
    });

    test('should calculate correct price for a Scotland collection postcode (Old Birds)', () => {
      expect(calculateOrderPrice("ML3 9AD", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65); // 55 + 10
    });

    test('should calculate correct price for an Aberdeen collection postcode (Old Birds)', () => {
      expect(calculateOrderPrice("AB10 1AB", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75); // 55 + 20
    });

    test('should calculate correct price for an Inverness collection postcode (Old Birds)', () => {
      expect(calculateOrderPrice("IV1 1AD", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
    });

    test('should calculate correct price for a Swansea collection postcode (Old Birds)', () => {
      expect(calculateOrderPrice("SA41 3PL", "S17 3AL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
    });

    test('should calculate correct price for a London delivery postcode (Old Birds)', () => {
      expect(calculateOrderPrice("S17 3AL", "TW7 6NY", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
    });

    test('should calculate correct price for a Scotland delivery postcode (Old Birds)', () => {
      expect(calculateOrderPrice("S17 3AL", "ML3 9AD", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65); // 55 + 10
    });

    test('should calculate correct price for an Aberdeen delivery postcode (Old Birds)', () => {
      expect(calculateOrderPrice("S17 3AL", "AB10 1AB", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75); // 55 + 20
    });

    test('should calculate correct price for an Inverness delivery postcode (Old Birds)', () => {
      expect(calculateOrderPrice("S17 3AL", "IV1 1AD", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
    });

    test('should calculate correct price for a Swansea delivery postcode (Old Birds)', () => {
      expect(calculateOrderPrice("S17 3AL", "SA41 3PL", 12, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
    });
  });
  
  describe('Other Animal Types', () => {
    test('should calculate correct price for 1 Aviary & Cage Bird', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60);
    });

    test('should calculate correct price for 2 Aviary & Cage Birds', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(70);
    });

    test('should calculate correct price for 10 Aviary & Cage Birds', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(150);
    });

    test('should calculate correct price for 1 Poultry & Gamebird', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
    });

    test('should calculate correct price for 2 Poultry & Gamebirds', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(109);
    });

    test('should calculate correct price for 10 Poultry & Gamebirds', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(189);
    });

    test('should calculate correct price for 1 Small Mammal', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
    });

    test('should calculate correct price for 2 Small Mammals', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(124);
    });

    test('should calculate correct price for 10 Small Mammals', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(324);
    });

    test('should calculate correct price for 1 Reptile', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
    });

    test('should calculate correct price for 2 Reptiles', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
    });

    test('should calculate correct price for 10 Reptiles', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(155);
    });
    
    test('should calculate correct price for 1 Bird of Prey', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
    });

    test('should calculate correct price for 2 Birds of Prey', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(124);
    });

    test('should calculate correct price for 10 Birds of Prey', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(324);
    });
    
    test('should calculate correct price for 1 Small Rodent', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
    });

    test('should calculate correct price for 2 Small Rodents', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
    });

    test('should calculate correct price for 10 Small Rodents', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(155);
    });
  });

  describe('Postcode Formatting', () => {
    test('should handle a postcode with length 7', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });

    test('should handle a postcode with length 6', () => {
      expect(calculateOrderPrice("DE5 3GY", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });

    test('should handle a postcode with length 5', () => {
      expect(calculateOrderPrice("L1 0AA", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });
    
    test('should handle an outward postcode with length 4', () => {
      expect(calculateOrderPrice("DE56", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });

    test('should handle an outward postcode with length 3', () => {
      expect(calculateOrderPrice("IV1", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
    });

    test('should handle an outward postcode with length 2', () => {
      expect(calculateOrderPrice("L1", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
    });
  });

  describe('Invalid Inputs', () => {

    test('should return false for a quantity of 0', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 0, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for a negative quantity', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", -1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for an invalid animal type', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, "Invalid Animal", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for an invalid collection postcode', () => {
      expect(calculateOrderPrice("XYZ 123", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for an invalid delivery postcode', () => {
      expect(calculateOrderPrice("DE56 1TP", "XYZ 123", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for an empty collection postcode', () => {
      expect(calculateOrderPrice("", "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for an empty delivery postcode', () => {
      expect(calculateOrderPrice("DE56 1TP", "", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });
    
    test('should return false for a non-string collection postcode', () => {
      expect(calculateOrderPrice(12345, "S17 3AL", 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for a non-string delivery postcode', () => {
      expect(calculateOrderPrice("DE56 1TP", 12345, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });

    test('should return false for a non-string animal type', () => {
      expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 12345, birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
    });
  });

});