import { db, getDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { expect, test } from 'vitest';
import { checkPostcodeForException } from '/js/ValidateAddress.js';


const postcodeExceptions = await getDocument(doc(db, "Settings", "postcodeExceptions"));


//delivery postcodes that are allowed 
test('Allowed delivery postcode all uppercase with one space', () => {
  expect(checkPostcodeForException("DE56 1TP", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Allowed delivery postcode with multiple cases', () => {
  expect(checkPostcodeForException("dE5 3gY", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Allowed delivery postcode uppercase no space', () => {
  expect(checkPostcodeForException("DE53GY", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Aberdeen postcode for delivery', () => {
  expect(checkPostcodeForException("AB10 1AH", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Inverness postcode for delivery', () => {
  expect(checkPostcodeForException("IV2 1AX", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Inverness outward postcode for delivery', () => {
  expect(checkPostcodeForException("IV32", postcodeExceptions, "DELIVERY")).toBe(false);
});




//deliverys postcodes that arent allowed
test('Irish postcode', () => {
  expect(checkPostcodeForException("BT", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Irish postcode', () => {
  expect(checkPostcodeForException("BT82", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Inverness postcode for delivery', () => {
  expect(checkPostcodeForException("IV1 1AX", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Isle of Wight postcode for delivery', () => {
  expect(checkPostcodeForException("PO30", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Dumfries postcode for delivery', () => {
  expect(checkPostcodeForException("DG6", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('West Scotland postcode for delivery', () => {
  expect(checkPostcodeForException("KA28", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Clydebank postcode for delivery', () => {
  expect(checkPostcodeForException("G84", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Dundee postcode for delivery', () => {
  expect(checkPostcodeForException("PH9", postcodeExceptions, "DELIVERY")).not.toBe(false);
});

test('Greenock postcode for delivery', () => {
  expect(checkPostcodeForException("PA80", postcodeExceptions, "DELIVERY")).not.toBe(false);
});




//collection postcodes that are allowed
test('Allowed collection postcode all uppercase with one space', () => {
  expect(checkPostcodeForException("DE56 1TP", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Allowed collection postcode with multiple cases', () => {
  expect(checkPostcodeForException("dE5 3gY", postcodeExceptions, "DELIVERY")).toBe(false);
});

test('Allowed collection postcode uppercase no space', () => {
  expect(checkPostcodeForException("DE53GY", postcodeExceptions, "DELIVERY")).toBe(false);
});




//collection postcodes that arent allowed
test('Aberdeen collection postcode', () => {
  expect(checkPostcodeForException("AB30", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Aberdeen collection postcode', () => {
  expect(checkPostcodeForException("AB10 1AH", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Inverness collection postcode', () => {
  expect(checkPostcodeForException("IV1 1AX", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Irish postcode', () => {
  expect(checkPostcodeForException("BT", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Irish postcode', () => {
  expect(checkPostcodeForException("BT82", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Isle of Wight postcode for collection', () => {
  expect(checkPostcodeForException("PO30", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Dumfries postcode for collection', () => {
  expect(checkPostcodeForException("DG6", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('West Scotland postcode for collection', () => {
  expect(checkPostcodeForException("KA28", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Clydebank postcode for collection', () => {
  expect(checkPostcodeForException("G84", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Dundee postcode for collection', () => {
  expect(checkPostcodeForException("PH9", postcodeExceptions, "COLLECTION")).not.toBe(false);
});

test('Greenock postcode for collection', () => {
  expect(checkPostcodeForException("PA80", postcodeExceptions, "COLLECTION")).not.toBe(false);
});
