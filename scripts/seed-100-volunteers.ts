import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const firstNames = [
  "Ahmed",
  "Fatima",
  "Mohammed",
  "Aisha",
  "Ali",
  "Layla",
  "Hassan",
  "Mariam",
  "Omar",
  "Zainab",
  "Khalid",
  "Noor",
  "Ibrahim",
  "Hana",
  "Karim",
  "Sara",
  "Youssef",
  "Leila",
  "Nasser",
  "Dina",
  "Amira",
  "Tariq",
  "Jasmine",
  "Rami",
  "Samir",
  "Rana",
  "Walid",
  "Huda",
  "Adel",
  "Nadia",
  "Rashid",
  "Lina",
  "Jamal",
  "Mona",
  "Fadi",
  "Rasha",
  "Salim",
  "Yasmin",
  "Malik",
  "Amina",
  "Hamza",
  "Noura",
  "Zaim",
  "Suha",
  "Bassam",
  "Alia",
  "Farah",
  "Jamir",
  "Layan",
  "Nasir",
  "Mirna",
  "Salma",
  "Amal",
  "Rayan",
  "Sila",
  "Karim",
  "Dalia",
  "Nabil",
  "Hani",
  "Mona",
  "Saeed",
  "Wafa",
  "Aziz",
  "Hana",
  "Rasheed",
  "Dina",
  "Mansour",
  "Lina",
  "Nizar",
  "Nadia",
  "Sami",
  "Rima",
  "Hakim",
  "Sara",
  "Talal",
  "Amal",
  "Jarir",
  "Noor",
  "Kamil",
  "Yara",
  "Hisham",
  "Dina",
  "Majid",
  "Maha",
  "Rizk",
  "Zina",
  "Tarek",
  "Hiba",
  "Nabil",
  "Layla",
]

const lastNames = [
  "Al-Ahmad",
  "Al-Hassan",
  "Al-Rashid",
  "Al-Salem",
  "Al-Mansour",
  "Al-Nadim",
  "Al-Karim",
  "Al-Noor",
  "Al-Amin",
  "Al-Azim",
  "Al-Malik",
  "Al-Wadud",
  "Al-Sami",
  "Al-Latif",
  "Al-Razzaq",
  "Al-Qadir",
  "Al-Hayy",
  "Al-Alim",
  "Al-Khaleej",
  "Al-Jawhara",
  "Al-Nakheel",
  "Al-Zahr",
  "Al-Safa",
  "Al-Marwa",
  "Al-Haram",
  "Al-Masid",
  "Al-Wadi",
  "Al-Qasim",
  "Al-Ahsa",
  "Al-Jouf",
]

async function seedVolunteers() {
  console.log("Seeding 100 volunteers...")
  try {
    const volunteers = []

    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      const email = `volunteer${i}@example.com`
      const phone = `+966${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`
      const hall_number = String((i % 4) + 1)
      const volunteer_id = `V${String(i).padStart(4, "0")}`
      const is_best = i % 10 === 0 // Every 10th volunteer is marked as best

      volunteers.push({
        name,
        email,
        phone,
        hall_number,
        volunteer_id,
        is_best,
      })
    }

    // Batch insert
    for (let i = 0; i < volunteers.length; i += 10) {
      const batch = volunteers.slice(i, Math.min(i + 10, volunteers.length))

      for (const vol of batch) {
        await sql.query(
          "INSERT INTO volunteers (name, email, phone, hall_number, details, is_best_volunteer) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING",
          [
            vol.name,
            vol.email,
            vol.phone,
            vol.hall_number,
            JSON.stringify({ volunteer_id: vol.volunteer_id }),
            vol.is_best,
          ],
        )
      }
      console.log(`Seeded ${Math.min(i + 10, volunteers.length)}/100 volunteers...`)
    }

    console.log("Successfully seeded 100 volunteers!")
  } catch (error) {
    console.error("Error seeding volunteers:", error)
    throw error
  }
}

seedVolunteers()
  .then(() => {
    console.log("Seeding complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })
