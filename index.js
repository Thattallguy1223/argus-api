const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create Supabase client with your secret key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test route
app.get('/', (req, res) => {
  res.send('Argus backend is live');
});

// Update a task
app.post('/update-task', async (req, res) => {
  const { id, updates } = req.body;
  const { data, error } = await supabase
    .from('project_log')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// Add a skill
app.post('/add-skill', async (req, res) => {
  const { name, description, category } = req.body;
  const { data, error } = await supabase
    .from('skills')
    .insert([{ name, description, category }]);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Argus backend running`);
});
