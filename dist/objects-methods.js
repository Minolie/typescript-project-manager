"use strict";
const userName = 'Maximilian';
console.log(userName);
const hobbies = ['hiking', 'swimming'];
const activeHobbies = ['horse riding'];
activeHobbies.push(...hobbies);
console.log("activeHobbies", activeHobbies);
const person = {
    Fname: "Minolie",
    age: 2
};
const pullObject = Object.assign({}, person);
const { Fname, age } = person;
console.log("Fname", Fname);
const add = (...numbers) => {
    const numReduce = numbers.reduce((currResult, currValue) => {
        return currResult + currValue;
    });
    console.log("numReduce", numReduce);
};
const addedNumbers = add(4, 3, 4, 2, 2.3);
//# sourceMappingURL=objects-methods.js.map