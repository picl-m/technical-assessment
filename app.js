import express from "express";
import "dotenv/config";
import db from "./db.js";

const app = express();
const port = process.env.PORT || 5000;

function calculateAge(date) {
  const birthDate = new Date(date);
  const currDate = new Date();

  let age = currDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && currDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

app.get("/", async (req, res) => {
  try {
    const characters = await db.any("SELECT * FROM character");
    const nemeses = await db.any("SELECT * FROM nemesis");
    const secrets = await db.any("SELECT * FROM secret");

    const secretsMap = new Map(
      secrets.map((secret) => [secret.nemesis_id, secret]),
    );
    const nemesesMap = new Map(
      nemeses.map((nemesis) => [nemesis.character_id, nemesis]),
    );

    const data = {};
    let totalAge = 0;
    let totalWeight = 0;

    data.characters = characters.map((character) => {
      totalAge += calculateAge(character.born);
      totalWeight += Number(character.weight);
      character.nemesis = nemesesMap.get(character.id);
      if (character.nemesis)
        character.nemesis.secret = secretsMap.get(character.nemesis.id);

      return character;
    });

    const charCount = characters.length;

    data.characters_count = charCount;
    data.average_age = totalAge / charCount;
    data.average_weight = totalWeight / charCount;

    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
