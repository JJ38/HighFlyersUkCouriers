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

// // function calculateOrderPrice(collectionPostcodeInput, deliveryPostcodeInput, quantityInput, animalTypeInput, birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)

test('test test', () => {
  expect(calculateOrderPrice("DE56 1TP", "L1 0AA", 12, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);

});

test('test test', () => {
  expect(calculateOrderPrice("DE56 1TP", "L1 0AA", 13, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(57);

});

test('test test', () => {
  expect(1 == 1).toBe(true);

});