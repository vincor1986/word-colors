const inputBtn = document.querySelector(".input-btn");
const wordInput = document.querySelector(".word-input");
import colors from "./colors.js";

const colorRef = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

let colorArr = [],
  includedColors = [];

const getColorWord = async (word) => {
  const response = await fetch(
    `https://api.datamuse.com/words?ml=color&rel_jjb=${word}`
  );

  let data, data2, data3;

  try {
    data = await response.json();
  } catch (err) {
    console.log(err.message);
  }

  const response2 = await fetch(
    `https://api.datamuse.com/words?rel_trg=${word}`
  );

  try {
    data2 = await response2.json();
  } catch (err) {
    console.log(err.message);
  }

  data = data.concat(data2).sort((a, b) => {
    return b.score - a.score;
  });

  const response3 = await fetch(
    `https://api.datamuse.com/words?ml=color&rel_bga=${word}`
  );

  try {
    data3 = await response3.json();
  } catch (err) {
    console.log(err.message);
  }

  data = data.concat(data3).sort((a, b) => {
    return b.score - a.score;
  });

  return data;
};

const randomInt = (int) => {
  let index = colorRef.indexOf(int);

  let check = Math.floor(Math.random() * 3);

  switch (check) {
    case 0:
      index -= 1;

    case 1:
      break;

    case 2:
      index += 1;
      break;
  }

  if (index < 0) {
    index = 0;
  }

  return colorRef[index];
};

const randomLetter = (letter) => {
  let index = colorRef.indexOf(letter);

  let check = Math.floor(Math.random() * 3);

  switch (check) {
    case 0:
      index -= 1;
      break;
    case 1:
      break;
    case 2:
      index += 1;
  }

  if (index > 15) {
    index = 15;
  }

  return colorRef[index];
};

const randomiseColor = (hex) => {
  let hexArr = hex.split("");
  let numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const newHex = hexArr.map((val, index) => {
    if (!numbers.includes(val)) {
      return randomLetter(val);
    } else {
      return randomInt(val);
    }
  });
  return newHex.join("");
};

const findMiddleColor = (hexA, hexB) => {
  let result = "";
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(
      (colorRef.indexOf(hexA[i]) + colorRef.indexOf(hexB[i])) / 2
    );
    result += colorRef[index];
  }

  return { hex: result };
};

const prepColorArray = (arr) => {
  arr.forEach((val) => {
    val.score = 0;
    let characters = val.hex.split("");
    characters.forEach((char) => {
      val.score += colorRef.indexOf(char);
    });
  });

  arr.sort((a, b) => {
    return a.score - b.score;
  });

  while (arr.length > 2) {
    let random = Math.floor(Math.random() * arr.length);
    arr.splice(random, 1);
  }

  arr[4] = arr[1];
  arr[2] = findMiddleColor(arr[0].hex, arr[4].hex);
  arr[1] = findMiddleColor(arr[0].hex, arr[2].hex);
  arr[3] = findMiddleColor(arr[2].hex, arr[4].hex);
};

inputBtn.addEventListener("click", async () => {
  colorArr = [];
  includedColors = [];

  let input = wordInput.value;

  if (colors[`${input}`]) {
    colorArr.push({ hex: randomiseColor(colors[`${input}`]) });
  }

  let response = await getColorWord(input);
  console.log(response);

  response.forEach((val) => {
    if (
      colors[`${val.word}`] &&
      colorArr.length < 2 &&
      !includedColors.includes(val.word)
    ) {
      console.log("color found: ", val.word);
      colorArr.push({
        hex: randomiseColor(colors[`${val.word}`]),
        color: val.word,
      });
      includedColors.push(val.word);
    }
  });

  let index = 0;

  while (colorArr.length < 2 && index <= response.length) {
    console.log("contigency");

    if (!response[index]) {
      break;
    }

    if (
      !Object.keys(colors).includes(response[index].word) &&
      response[index].word !== "clear"
    ) {
      let response2 = await getColorWord(response[index].word);

      response2.forEach((val) => {
        if (
          colors[`${val.word}`] &&
          colorArr.length < 2 &&
          !includedColors.includes(val.word)
        ) {
          console.log(
            "color found: ",
            val.word,
            `from ${response[index].word}`
          );
          colorArr.push({
            hex: randomiseColor(colors[`${val.word}`]),
            color: val.word,
          });
          includedColors.push(val.word);
        }
      });
    }

    index++;
  }

  while (colorArr.length < 2) {
    let allColors = Object.keys(colors);
    let random = Math.floor(Math.random() * allColors.length);
    colorArr.push({ hex: colors[allColors[random]] });
  }

  console.log(colorArr);

  prepColorArray(colorArr);

  console.log(colorArr);

  colorArr.forEach((val, index) => {
    let el = document.getElementById(`color${index + 1}`);
    el.style.backgroundColor = `#${val.hex}`;
  });

  colorArr.forEach((color, i) => {
    const el = document.querySelector(`.color${i + 1}-hex`);
    el.innerText = `#${color.hex}`;
  });

  const copyBtns = Array.from(document.querySelectorAll(".copy-btn"));

  copyBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(`#${colorArr[index].hex}`);
      const copyMsg = document.querySelector(".copy-msg");
      copyMsg.style.display = "block";
      setTimeout(() => (copyMsg.style.display = "none"), 2000);
    });
  });
});
