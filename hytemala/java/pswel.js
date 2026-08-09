/*
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


const generateButtonEl = document.querySelector(".generate-button");
const uppercaseCheckboxEl = document.querySelector(".uppercase-checkbox");
const lowercaseCheckboxEl = document.querySelector(".lowercase-checkbox");
const numbersCheckboxEl = document.querySelector(".numbers-checkbox");
const symbolsCheckboxEl = document.querySelector(".symbols-checkbox");
const passwordDisplayEl = document.querySelector(".password-display");
const passwordLengthInputEl = document.querySelector(".input-length");
const copyButtonEl = document.querySelector(".copy-button");

const symbols = "!@#$%^&*()_-+=<>?/:;{}[]";
let password = "";

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomUppercase() {
    return String.fromCharCode(getRandomInteger(65, 91));
}

function getRandomLowercase() {
    return String.fromCharCode(getRandomInteger(97, 123));
}

function getRandomNumber() {
    return String(getRandomInteger(0, 10));
}

function getRandomSymbol() {
    const index = getRandomInteger(0, symbols.length);
    return symbols.charAt(index);
}

generateButtonEl.addEventListener("click", generatePassword);

function generatePassword() {
    password = "";
    let passwordLength = passwordLengthInputEl.value;

    const funcArray = [];
    if (uppercaseCheckboxEl.checked) {
        password += getRandomUppercase();
        funcArray.push(getRandomUppercase);
    }
    if (lowercaseCheckboxEl.checked) {
        password += getRandomLowercase();
        funcArray.push(getRandomLowercase);
    }
    if (numbersCheckboxEl.checked) {
        password += getRandomNumber();
        funcArray.push(getRandomNumber);
    }
    if (symbolsCheckboxEl.checked) {
        password += getRandomSymbol();
        funcArray.push(getRandomSymbol);
    }

    for (let i = 0; i < passwordLength - funcArray.length; i++) {
        const index = getRandomInteger(0, funcArray.length);
        password += funcArray[index]();
    }

    console.log(funcArray);
    console.log(password);
    passwordDisplayEl.value = password;
}

copyButtonEl.addEventListener("click", copyPasswordToClipboard);

async function copyPasswordToClipboard() {
    try {
        await navigator.clipboard.writeText(password);
        alert("Password Copied to clipboard");
    } catch (error) {
        console.error("failed to copy password to clipboard", error);
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        generatePassword();
    }
});