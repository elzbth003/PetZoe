import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgres://postgres:postgres@localhost:5432/petzoe_db'
});

async function seedData() {
  await client.connect();

  const shelterId = 7; // ID for "pethub" shelter

  const animals = [
    {
      animal_code: 'DOG-001',
      name: 'Max',
      species: 'DOG',
      breed: 'Golden Retriever',
      sex: 'MALE',
      estimated_age_months: 24,
      weight_kg: 28.5,
      color: 'Golden',
      status: 'IN_SHELTER_CARE',
      general_condition: 'HEALTHY'
    },
    {
      animal_code: 'CAT-001',
      name: 'Luna',
      species: 'CAT',
      breed: 'Siamese',
      sex: 'FEMALE',
      estimated_age_months: 12,
      weight_kg: 4.2,
      color: 'Cream and Brown',
      status: 'IN_SHELTER_CARE',
      general_condition: 'HEALTHY'
    },
    {
      animal_code: 'DOG-002',
      name: 'Bella',
      species: 'DOG',
      breed: 'Labrador',
      sex: 'FEMALE',
      estimated_age_months: 8,
      weight_kg: 15.0,
      color: 'Black',
      status: 'UNDER_MEDICAL_CARE',
      general_condition: 'NEEDS_ATTENTION'
    }
  ];

  try {
    for (const animal of animals) {
      await client.query(
        `INSERT INTO animals 
         (animal_code, name, species, breed, sex, estimated_age_months, weight_kg, color, status, general_condition, sterilization_status, shelter_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [animal.animal_code, animal.name, animal.species, animal.breed, animal.sex, animal.estimated_age_months, animal.weight_kg, animal.color, animal.status, animal.general_condition, 'NOT_STERILIZED', shelterId]
      );
    }
    console.log('Successfully added animals to the shelter');
  } catch (err) {
    console.error('Error adding data:', err);
  } finally {
    await client.end();
  }
}

seedData();
